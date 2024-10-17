import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LanguageIcon from '@mui/icons-material/Language';
import AssignmentIcon from '@mui/icons-material/Assignment';
import {useRouter} from "next/navigation";
import {IFiltersView} from "@/app/models/FiltersView";
import {Box} from "@mui/material";

export const MainListItems = ({filtersViews} : {filtersViews: IFiltersView[]}) => {
    const router = useRouter()
    return (
        <>
            <ListItemButton onClick={() => router.push('/dashboard')}>
                <ListItemIcon>
                    <DashboardIcon sx={{marginLeft: '6px'}}/>
                </ListItemIcon>
                <ListItemText primary="Dashboard"/>
            </ListItemButton>
            <ListItemButton onClick={() => router.push('/websites')}>
                <ListItemIcon>
                    <LanguageIcon sx={{marginLeft: '6px'}}/>
                </ListItemIcon>
                <ListItemText primary="Websites"/>
            </ListItemButton>
            <ListItemButton onClick={() => router.push('/alerts')}>
                <ListItemIcon>
                    <LanguageIcon sx={{marginLeft: '6px'}}/>
                </ListItemIcon>
                <ListItemText primary="Alerts"/>
            </ListItemButton>
            {filtersViews && filtersViews.map((filterView) => (
                <ListItemButton key={filterView.id} onClick={() => router.push(`/websites?filterView=${filterView.id}`)}>
                    <ListItemIcon>
                    </ListItemIcon>
                    <ListItemText primary={`- ${filterView.title}`} sx={{color: 'gray'}}/>
                </ListItemButton>
            ))}
        </>
    );
}

export const secondaryListItems = (
    <React.Fragment>
        <ListSubheader component="div" inset>
            Saved reports
        </ListSubheader>
        <ListItemButton>
            <ListItemIcon>
                <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Current month" />
        </ListItemButton>
        <ListItemButton>
            <ListItemIcon>
                <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Last quarter" />
        </ListItemButton>
        <ListItemButton>
            <ListItemIcon>
                <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Year-end sale" />
        </ListItemButton>
    </React.Fragment>
);