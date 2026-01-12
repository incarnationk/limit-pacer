import { IPublicClientApplication, AccountInfo } from "@azure/msal-browser";
import { Member, Task } from "@/data/mock";

const GRAPH_ENDPOINT = "https://graph.microsoft.com/v1.0";

export const EXCEL_CONFIG = {
    FILE_NAME: "limit-pacer.xlsx",
    TABLES: {
        MEMBERS: "Start_Members",
        TASKS: "Start_Tasks"
    }
} as const;

const EXCEL_EPOCH_OFFSET = 25569;


async function getToken(instance: IPublicClientApplication, account: AccountInfo) {
    const request = {
        scopes: ["User.Read", "Files.ReadWrite"],
        account: account
    };
    try {
        const response = await instance.acquireTokenSilent(request);
        return response.accessToken;
    } catch (e) {
        // Fallback to interaction if silent fails
        const response = await instance.acquireTokenPopup(request);
        return response.accessToken;
    }
}


async function getFileId(instance: IPublicClientApplication, account: AccountInfo, fileName: string): Promise<string> {
    const token = await getToken(instance, account);
    const escapedFileName = fileName.replace(/'/g, "''");
    const searchUrl = `${GRAPH_ENDPOINT}/me/drive/root/children?$filter=name eq '${escapedFileName}'`;

    const response = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
        const errorText = await response.text();
        if (process.env.NODE_ENV !== 'production') {
            console.error(`Failed to list files:`, errorText);
        }
        throw new Error("ファイルの取得に失敗しました。");
    }

    const data = await response.json();
    if (data.value && data.value.length > 0) {
        return data.value[0].id;
    }
    throw new Error(`File '${fileName}' not found in OneDrive root.`);
}

export async function fetchExcelTable(instance: IPublicClientApplication, account: AccountInfo, tableName: string) {
    const token = await getToken(instance, account);

    const fileId = await getFileId(instance, account, EXCEL_CONFIG.FILE_NAME);

    const response = await fetch(`${GRAPH_ENDPOINT}/me/drive/items/${fileId}/workbook/tables/${tableName}/rows`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
        const errorText = await response.text();
        if (process.env.NODE_ENV !== 'production') {
            console.error(`Error fetching table ${tableName}:`, errorText);
        }
        throw new Error("データの取得に失敗しました。");
    }

    const data = await response.json();
    return data.value; // Array of table rows
}

export function mapRowToMember(row: any): Member {
    const cells = row.values[0];

    // Basic validation: Ensure enough cells exist
    if (!cells || cells.length < 6) {
        console.warn("Invalid member row data (insufficient columns):", row);
        throw new Error("メンバーデータの形式が正しくありません。");
    }

    const email = cells[4] ? String(cells[4]).toLowerCase().trim() : undefined;
    // Simple email format validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.warn(`Invalid email format detected: ${email}`);
    }

    const authority = cells[5] ? String(cells[5]).toLowerCase().trim() : undefined;
    // Authority whitelist validation
    const validAuthorities = ['admin', 'user'];
    const sanitizedAuthority = (authority && validAuthorities.includes(authority)) ? authority : 'user';

    return {
        id: sanitizeString(cells[0]),
        name: sanitizeString(cells[1]),
        group: sanitizeString(cells[2]),
        role: (sanitizeString(cells[3]) as any), // Type cast to Role
        email: email,
        authority: sanitizedAuthority,
        team: cells[6] ? sanitizeString(cells[6]) : undefined,
        location: 'Unknown'
    };
}

export function mapRowToTask(row: any): Task {
    const cells = row.values[0];

    // Basic validation: Ensure enough cells exist
    if (!cells || cells.length < 4) {
        console.warn("Invalid task row data (insufficient columns):", row);
        throw new Error("タスクデータの形式が正しくありません。");
    }

    const completedByString = String(cells[5] || "").trim();

    return {
        rowIndex: row.index,
        id: sanitizeString(cells[0]),
        content: sanitizeString(cells[1]),
        deadline: convertExcelDate(cells[2]),
        target: (sanitizeString(cells[3] || '全員') as any), // Type cast to Role
        link: (cells[4] ? sanitizeString(cells[4]) : "#") || "#",
        isCompleted: false,
        completedBy: completedByString ? completedByString.split(',').map((s: string) => s.trim()).filter((s: string) => s !== "") : []
    };
}

function sanitizeString(val: any): string {
    if (!val) return '';
    const str = String(val);
    return str.replace(/<[^>]*>?/gm, '').trim();
}

function convertExcelDate(val: any): string {
    if (typeof val === 'number') {
        const date = new Date((val - EXCEL_EPOCH_OFFSET) * 86400 * 1000);
        return date.toISOString().split('T')[0];
    }

    // If it looks like a number in string form
    const numVal = Number(val);
    if (!isNaN(numVal) && numVal > 10000) { // arbitrary formatting check (e.g. year 2000+ is >36000)
        const date = new Date((numVal - EXCEL_EPOCH_OFFSET) * 86400 * 1000);
        return date.toISOString().split('T')[0];
    }

    return String(val);
}

export async function updateTaskCompletionInExcel(
    instance: IPublicClientApplication,
    account: AccountInfo,
    task: Task,
    newCompletedBy: string[]
) {
    if (task.rowIndex === undefined) {
        throw new Error("Cannot update task without rowIndex");
    }

    const token = await getToken(instance, account);
    const newStatsStr = newCompletedBy.join(',');

    const fileId = await getFileId(instance, account, EXCEL_CONFIG.FILE_NAME);

    const rowRangeUrl = `${GRAPH_ENDPOINT}/me/drive/items/${fileId}/workbook/tables/${EXCEL_CONFIG.TABLES.TASKS}/rows/itemAt(index=${task.rowIndex})/range`;
    const rowRangeResp = await fetch(rowRangeUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!rowRangeResp.ok) {
        const errorText = await rowRangeResp.text();
        if (process.env.NODE_ENV !== 'production') {
            console.error("Failed to get row range:", errorText);
        }
        throw new Error("更新対象の特定に失敗しました。");
    }
    const cellUrl = `${GRAPH_ENDPOINT}/me/drive/items/${fileId}/workbook/tables/${EXCEL_CONFIG.TABLES.TASKS}/rows/itemAt(index=${task.rowIndex})/range/cell(row=0,column=5)`;



    const response = await fetch(cellUrl, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            values: [[newStatsStr]]
        })
    });

    if (!response.ok) {
        const err = await response.text();
        if (process.env.NODE_ENV !== 'production') {
            console.error("Failed to update Excel:", err);
        }
        throw new Error("タスクの更新に失敗しました。");
    }

}
