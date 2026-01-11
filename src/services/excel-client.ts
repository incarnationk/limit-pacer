import { IPublicClientApplication, AccountInfo } from "@azure/msal-browser";
import { Member, Task } from "@/data/mock";

const GRAPH_ENDPOINT = "https://graph.microsoft.com/v1.0";
const FILE_PATH = "/me/drive/root:/limit-pacer.xlsx:";

// Helper to get access token
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

// Helper to find file ID by name in root
async function getFileId(instance: IPublicClientApplication, account: AccountInfo, fileName: string): Promise<string> {
    const token = await getToken(instance, account);
    // Use OData filter to find the file
    const searchUrl = `${GRAPH_ENDPOINT}/me/drive/root/children?$filter=name eq '${fileName}'`;

    const response = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
        throw new Error(`Failed to list files: ${await response.text()}`);
    }

    const data = await response.json();
    if (data.value && data.value.length > 0) {
        return data.value[0].id;
    }
    throw new Error(`File '${fileName}' not found in OneDrive root.`);
}

export async function fetchExcelTable(instance: IPublicClientApplication, account: AccountInfo, tableName: string) {
    const token = await getToken(instance, account);

    // 1. Get File ID (More robust than path syntax)
    const fileId = await getFileId(instance, account, "limit-pacer.xlsx");

    // 2. Access Workbook via ID
    const response = await fetch(`${GRAPH_ENDPOINT}/me/drive/items/${fileId}/workbook/tables/${tableName}/rows`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching table ${tableName}:`, errorText);
        throw new Error(`Graph API specific error: ${errorText}`);
    }

    const data = await response.json();
    return data.value; // Array of table rows
}

// Convert Excel Row Data (Array of arrays) to Member Object
export function mapRowToMember(row: any): Member {
    // row.values is [[id, name, team, role, ...]]
    const cells = row.values[0];
    return {
        id: String(cells[0]),
        name: cells[1],
        group: cells[2],
        role: cells[3],
        email: cells[4] ? String(cells[4]).toLowerCase() : undefined,
        authority: cells[5] ? String(cells[5]).toLowerCase() : undefined,
        team: cells[6] ? String(cells[6]) : undefined,
        location: 'Unknown' // Default for now
    };
}

// Convert Excel Row Data to Task Object
export function mapRowToTask(row: any): Task {
    const cells = row.values[0];
    const completedByString = String(cells[5] || "");

    return {
        rowIndex: row.index, // Store the row index from Graph API
        id: String(cells[0]),
        content: cells[1],
        deadline: convertExcelDate(cells[2]),
        target: cells[3],
        link: cells[4] || "#",
        isCompleted: false,
        completedBy: completedByString.split(',').map((s: string) => s.trim()).filter((s: string) => s !== "")
    };
}

// Helper to handle Excel Date formats
function convertExcelDate(val: any): string {
    // If it's a number (Excel Serial Date), convert to YYYY-MM-DD
    // Excel base date: Dec 30, 1899 (approx). 
    // Unix epoch (1970-01-01) is 25569 days after Excel epoch.
    if (typeof val === 'number') {
        const date = new Date((val - 25569) * 86400 * 1000);
        return date.toISOString().split('T')[0];
    }

    // If it looks like a number in string form
    const numVal = Number(val);
    if (!isNaN(numVal) && numVal > 10000) { // arbitrary formatting check (e.g. year 2000+ is >36000)
        const date = new Date((numVal - 25569) * 86400 * 1000);
        return date.toISOString().split('T')[0];
    }

    // Otherwise return as is (assuming it's already a string like "2024-12-31")
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

    // 1. Get File ID
    const fileId = await getFileId(instance, account, "limit-pacer.xlsx");

    // Use Table-relative addressing which is safer than calculating absolute row
    // PATCH /workbook/tables/{tableName}/rows/itemAt(index={rowIndex})
    // Note: To update specific column in a row, we pass values for that row.
    // However, Graph API PATCH row requires all values or careful handling.
    // Actually, 'range(address=...)' is fine IF we get the address from the table row.

    // Better strategy: Get the Range for the specific cell using Table Row + Column Name
    // But Column Name mapping to index is tricky without metadata.
    // 'completedBy' is column 6 (Index 5) in our definition.

    // Let's use the 'Range' of the specific cell by calculating offset from Table Range.
    // OR simpler: Use the logic we had but verify Table header position? 
    // No, let's use the 'table/rows/itemAt' to get the row's Range address first, then calculate cell.
    // That's two calls.

    // Alternative: Just PATCH the whole row with existing values + new value?
    // We don't have all existing values in 'task' object perfectly (some might be missing/truncated?).

    // Let's stick to Range Address but make sure we target the TABLE's sheet and assume 'Start_Tasks' table.
    // The previous code assumed 'Tasks' WORKsheet and 'F' column.
    // If the user renamed the sheet or moved the table, it breaks.

    // NEW STRATEGY:
    // 1. Get the Range for the Row using Table Row Index
    // 2. Patch the specific cell in that range (Column 5/F)

    const rowRangeUrl = `${GRAPH_ENDPOINT}/me/drive/items/${fileId}/workbook/tables/Start_Tasks/rows/itemAt(index=${task.rowIndex})/range`;
    const rowRangeResp = await fetch(rowRangeUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!rowRangeResp.ok) throw new Error("Failed to get row range");
    const rowRangeData = await rowRangeResp.json();

    // rowRangeData.address is like "Tasks!A2:F2"
    // We need the 6th cell (Column F) in that range.
    // We can use the 'cell(row, column)' endpoint on the range? No such endpoint on range.

    // Let's just use the Worksheet 'Range' PATCH, but use the exact address we found?
    // Actually, let's use the safer "Column based" update if possible.
    // Graph API allows patching a Range.

    // Let's rely on the fact that we know it's Column Index 5 (0-based) of the table.
    const cellUrl = `${GRAPH_ENDPOINT}/me/drive/items/${fileId}/workbook/tables/Start_Tasks/rows/itemAt(index=${task.rowIndex})/range/cell(row=0,column=5)`;

    // Force value to be treated as String by Excel to prevent scientific notation conversion
    // Prepending an apostrophe (') is a common Excel trick, but Graph API might just handle strings?
    // Let's try sending just the string first. If it was "ID,ID", it shouldn't be a number.
    // The previous issue was likely reading numeric data as scientific notation.

    // We will clean the input: Ensure no scientific notation strings exist in the array to begin with?
    // But better to just Write it cleanly.

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
        console.error("Failed to update Excel:", err);
        throw new Error(`Failed to update task: ${err}`);
    }

}
