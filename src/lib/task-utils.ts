/**
 * Defined role mapping for Japanese target groups.
 */
export const ROLE_GROUPS: Record<string, string[]> = {
    管理者: ['SM', 'Mgr'],
    役職者: ['SM', 'Mgr', 'AM', 'L', 'AL'],
    社員: ['SM', 'Mgr', 'AM', 'L', 'AL', 'T', 'H'],
    BP: ['BP']
};

/**
 * Determines if a task is visible to a user based on their role and the task target.
 * 
 * Target definitions:
 * - 全員: Visible to everyone
 * - Role Group (e.g., 役職者): Visible if user's role is in that group
 * - Direct Role Match: Visible if user's role matches exactly
 * 
 * @param userRole The role code of the user (e.g., 'SM', 'T')
 * @param target The target string from Excel data
 * @returns boolean
 */
export const isTaskVisible = (userRole: string, target: string): boolean => {
    if (target === '全員') return true;
    if (target === userRole) return true; // Direct match

    // Check if userRole is included in the target group
    const allowedRoles = ROLE_GROUPS[target] || [];
    return allowedRoles.includes(userRole);
};
