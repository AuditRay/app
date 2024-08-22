'use server';
import {verifySession} from "@/app/lib/session"
import {getWorkspaces} from "@/app/actions/workspaceActions";
import {IRole, Role, User} from "@/app/models";
import {AdminRole} from "@/app/premissions/roles/Admin";
import {MemberRole} from "@/app/premissions/roles/Member";

export async function getUser(fullUser = false) {
    const session = await verifySession();
    const user = session.user;
    if(user && fullUser) {
        user.workspaces = await getWorkspaces(session.user.id);
        const roles: IRole[] = [];
        for (const workspace of user.workspaces) {
            const memberRoles = workspace.members?.find(member => member.user.toString() === user.id)?.roles;
            const workspaceOwner = workspace.owner.toString() === user.id;
            if(workspaceOwner){
                const roleData = await AdminRole();
                roles.push(roleData);
            }else if(memberRoles){
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

export async function getFullUser(userId: string) {
    const user = (await User.findOne({_id: userId}))?.toJSON();
    if(user) {
        user.workspaces = await getWorkspaces(user.id);
        const roles: IRole[] = [];
        for (const workspace of user.workspaces) {
            const memberRoles = workspace.members?.find(member => member.user.toString() === user.id)?.roles;
            const workspaceOwner = workspace.owner.toString() === user.id;
            if(workspaceOwner){
                const roleData = await AdminRole();
                roles.push(roleData);
            }else if(memberRoles){
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
    console.log('user', user);
    return JSON.parse(JSON.stringify(user));
}