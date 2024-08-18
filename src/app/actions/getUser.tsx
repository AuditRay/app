'use server';
import {verifySession} from "@/app/lib/session"
import {getWorkspaces} from "@/app/actions/workspaceActions";
import {IRole, Role} from "@/app/models";
import {AdminRole} from "@/app/premissions/roles/Admin";
import {MemberRole} from "@/app/premissions/roles/Member";

export async function getUser() {
    const session = await verifySession();
    const user = session.user;
    if(user){
        user.workspaces = await getWorkspaces(session.user.id);
        const roles: IRole[] = [];
        for (const workspace of user.workspaces) {
            const memberRoles = workspace.members?.find(member => member.user.toString() === user.id)?.roles;
            if(memberRoles){
                for (const memberRole of memberRoles) {
                    if (memberRole == "default_admin"){
                        const roleData = await AdminRole();
                        roles.push(roleData);
                    } else if (memberRole == "default_member"){
                        const roleData = await MemberRole();
                        roles.push(roleData);
                    } else {
                        const roleData = await Role.findOne({_id: memberRole});
                        roleData && roles.push(roleData);
                    }
                }
            }
        }
        user.roles = roles;
    }
    return user;
}