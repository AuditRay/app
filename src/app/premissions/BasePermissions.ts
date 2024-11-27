import {getWebsitesListing} from "@/app/actions/websiteActions";
import {getWebsiteViewsListing} from "@/app/actions/websiteViewsActions";
import {getFiltersViews} from "@/app/actions/filterViewsActions";

export const BasePermissions = {
    'View Dashboard': {
        id: 'View Dashboard',
        default: false,
        description: 'View the dashboard',
        icon: 'dashboard',
        group: 'Workspaces'
    },
    'View Assigned Websites': {
        id: 'View Assigned Websites',
        default: false,
        description: 'View assigned websites',
        icon: 'visibility',
        group: 'Websites',
    },
    'Add New Website': {
        id: 'Add New Website',
        default: false,
        description: 'Add a new website',
        icon: 'add',
        group: 'Websites',
    },
    'Edit Website': {
        id: 'Edit Website',
        default: false,
        description: 'Edit a website',
        icon: 'edit',
        group: 'Websites',
    },
    'Delete Website': {
        id: 'Delete Website',
        default: false,
        description: 'Delete a website',
        icon: 'delete',
        group: 'Websites',
    },
    'View Website Views': {
        id: 'View Website Views',
        default: false,
        description: 'View website views',
        icon: 'view_list',
        group: 'Websites',
    },
    'Add Website View': {
        id: 'Add Website View',
        default: false,
        description: 'Add a website view',
        icon: 'add',
        group: 'Website Views',
    },
    'Edit Website View': {
        id: 'Edit Website View',
        default: false,
        description: 'Edit a website view',
        icon: 'edit',
        group: 'Website Views',
    },
    'Delete Website View': {
        id: 'Delete Website View',
        default: false,
        description: 'Delete a website view',
        icon: 'delete',
        group: 'Website Views',
    },
    'View Website Connection tokens': {
        id: 'View Website Connection tokens',
        default: false,
        description: 'View website connection tokens',
        icon: 'lock',
        group: 'Websites',
    },
    'View Filters View': {
        id: 'View Filters View',
        default: false,
        description: 'View filters view',
        icon: 'view_list',
        group: 'Filters'
    },
    'Add Filters View': {
        id: 'Add Filters View',
        default: false,
        description: 'Add a filters view',
        icon: 'add',
        group: 'Filters'
    },
    'Edit Filters View': {
        id: 'Edit Filters View',
        default: false,
        description: 'Edit a filters view',
        icon: 'edit',
        group: 'Filters'
    },
    'Delete Filters View': {
        id: 'Delete Filters View',
        default: false,
        description: 'Delete a filters view',
        icon: 'delete',
        group: 'Filters'
    },
    'Add Workspace': {
        id: 'Add Workspace',
        default: false,
        description: 'Add a workspace',
        icon: 'add',
        group: 'Workspaces'
    },
    'Edit Workspace': {
        id: 'Edit Workspace',
        default: false,
        description: 'Edit a workspace',
        icon: 'edit',
        group: 'Workspaces'
    },
    'Delete Workspace': {
        id: 'Delete Workspace',
        default: false,
        description: 'Delete a workspace',
        icon: 'delete',
        group: 'Workspaces'
    },
    'Access Workspace Settings': {
        id: 'Access Workspace Settings',
        default: false,
        description: 'Access workspace settings',
        icon: 'settings',
        group: 'Workspaces'
    },
    'Manage Workspace Fields': {
        id: 'Manage Workspace Fields',
        default: false,
        description: 'Manage workspace fields',
        icon: 'input',
        group: 'Workspaces'
    },
    'View Workspace Users': {
        id: 'View Workspace Users',
        default: false,
        description: 'View workspace users',
        icon: 'view_list',
        group: 'Workspace Users'
    },
    'Add Workspace User': {
        id: 'Add Workspace User',
        default: false,
        description: 'Add a workspace user',
        icon: 'add',
        group: 'Workspace Users'
    },
    'Edit Workspace User': {
        id: 'Edit Workspace User',
        default: false,
        description: 'Edit a workspace user',
        icon: 'edit',
        group: 'Workspace Users'
    },
    'Delete Workspace User': {
        id: 'Delete Workspace User',
        default: false,
        description: 'Delete a workspace user',
        icon: 'delete',
        group: 'Workspace Users'
    },
    'View Workspace Teams': {
        id: 'View Workspace Teams',
        default: false,
        description: 'View workspace teams',
        icon: 'view_list',
        group: 'Workspace Teams'
    },
    'Add Workspace Team': {
        id: 'Add Workspace Team',
        default: false,
        description: 'Add a workspace team',
        icon: 'add',
        group: 'Workspace Teams'
    },
    'Edit Workspace Team': {
        id: 'Edit Workspace Team',
        default: false,
        description: 'Edit a workspace team',
        icon: 'edit',
        group: 'Workspace Teams'
    },
    'Delete Workspace Team': {
        id: 'Delete Workspace Team',
        default: false,
        description: 'Delete a workspace team',
        icon: 'delete',
        group: 'Workspace Teams'
    },
    'View Workspace Roles': {
        id: 'View Workspace Roles',
        default: false,
        description: 'View workspace roles',
        icon: 'view_list',
        group: 'Workspace Roles'
    },
    'Add Workspace Role': {
        id: 'Add Workspace Role',
        default: false,
        description: 'Add a workspace role',
        icon: 'add',
        group: 'Workspace Roles'
    },
    'Edit Workspace Role': {
        id: 'Edit Workspace Role',
        default: false,
        description: 'Edit a workspace role',
        icon: 'edit',
        group: 'Workspace Roles'
    },
    'Delete Workspace Role': {
        id: 'Delete Workspace Role',
        default: false,
        description: 'Delete a workspace role',
        icon: 'delete',
        group: 'Workspace Roles'
    },
};

// make type for permission keys
export type PermissionsKeys = keyof typeof BasePermissions | string;
export type PermissionsValue = {
    id: string;
    default: boolean;
    description: string;
    icon: string;
    group: string;
};
export type Permissions = Record<PermissionsKeys, PermissionsValue>;

export const buildWorkspaceBasePermissions = async (workspaceId: string): Promise<Permissions> => {
    //load website view & filter names
    const permissions: Permissions = JSON.parse(JSON.stringify(BasePermissions));
    const websites = await getWebsitesListing(workspaceId);
    const viewsFilter = await getFiltersViews(workspaceId);
    for (const filter of viewsFilter) {
        permissions[`View Filters View ${filter.title}`] = {
            id: `View Filters View ${filter.title}`,
            default: false,
            description: 'View filters view',
            icon: 'view_list',
            group: 'Filters'
        };
        permissions[`Edit Filters View ${filter.title}`] = {
            id: `Edit Filters View ${filter.title}`,
            default: false,
            description: 'Edit filters view',
            icon: 'edit',
            group: 'Filters'
        };
        permissions[`Delete Filters View ${filter.title}`] = {
            id: `Delete Filters View ${filter.title}`,
            default: false,
            description: 'Delete filters view',
            icon: 'delete',
            group: 'Filters'
        };
    }
    for (const website of websites) {
        const views = await getWebsiteViewsListing(website.id);
        for (const view of views) {
            permissions[`View Website View ${website.url} ${view.title}`] = {
                id: `View Website View ${website.url} ${view.title}`,
                default: false,
                description: 'View website view',
                icon: 'view_list',
                group: 'Website Views'
            };
            permissions[`Edit Website View ${website.url} ${view.title}`] = {
                id: `Edit Website View ${website.url} ${view.title}`,
                default: false,
                description: 'Edit website view',
                icon: 'edit',
                group: 'Website Views'
            };
            permissions[`Delete Website View ${website.url} ${view.title}`] = {
                id: `Delete Website View ${website.url} ${view.title}`,
                default: false,
                description: 'Delete website view',
                icon: 'delete',
                group: 'Website Views'
            };
        }
    }

    return {
        ...permissions,
        'View Dashboard': {
            ...permissions["View Dashboard"],
            default: true
        },
        'View Assigned Websites': {
            ...permissions["View Assigned Websites"],
            default: true
        },
        'View Website Views': {
            ...permissions["View Website Views"],
            default: true
        },
    }
}

export const MemberRolePermissions = async (workspaceId: string): Promise<Permissions> => {
    const permissions = await buildWorkspaceBasePermissions(workspaceId);
    return {
        ...permissions,
        'View Dashboard': {
            ...permissions["View Dashboard"],
            default: true
        },
        'View Assigned Websites': {
            ...permissions["View Assigned Websites"],
            default: true
        },
        'View Website Views': {
            ...permissions["View Website Views"],
            default: true
        },
    }
}

export const AdminRolePermissions = async (workspaceId: string): Promise<Permissions> => {
    const permissions = await buildWorkspaceBasePermissions(workspaceId);
    for (const key in permissions) {
        permissions[key].default = true;
    }
    return permissions;
}