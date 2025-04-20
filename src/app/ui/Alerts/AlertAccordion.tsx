'use client'
import Accordion from "@mui/material/Accordion";
import * as React from "react";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionDetails from "@mui/material/AccordionDetails";
import {Box} from "@mui/material";
import {IAlertInfo} from "@/app/models/AlertInfo";
import {getAlert} from "@/app/actions/alertsActions";
import CircularProgress from "@mui/material/CircularProgress";
import AlertWebsitePreviewGrid from "@/app/ui/Alerts/AlertWebsitePreviewGrid";
import RightDrawer from "@/app/ui/RightDrawer";

export default function AlertAccordion({alertInfos, workspaceId}: { alertInfos: IAlertInfo[], workspaceId: string }) {
    const [isLoadingData, setIsLoadingData] = React.useState<Record<string, boolean>>();
    const [loadedData, setLoadedData] = React.useState<Record<string, IAlertInfo & {data: any}>>({});
    return (
        <>
            {alertInfos.map((alertInfo) => (
                <Accordion key={alertInfo.id}  onChange={(event: React.SyntheticEvent, isExpanded: boolean) => {
                   if (isExpanded) {
                       const getAlertInfo = async () => {
                           const info = await getAlert(alertInfo.id);
                           try {
                               const data = JSON.parse(info.data);
                               setLoadedData({
                                     ...loadedData,
                                     [alertInfo.id]: {
                                         ...info,
                                         data
                                     }
                               });
                               console.log(info);
                           } catch (e) {
                               console.error('Error parsing alert info', e);
                           }
                       }
                       console.log('loadedData', loadedData);
                       const isLoaded = loadedData[alertInfo.id];
                       if(isLoaded) {
                           console.log('Already loaded');
                           return;
                       }
                       setIsLoadingData({
                              ...isLoadingData,
                              [alertInfo.id]: true
                       });
                       getAlertInfo().finally(() => {
                              setIsLoadingData({
                                  ...isLoadingData,
                                  [alertInfo.id]: false
                              });
                       });
                   }
                }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                        sx={{textTransform: 'capitalize'}}
                    >
                        {alertInfo.subject.replaceAll('Alert: ', '')}
                    </AccordionSummary>
                    <AccordionDetails>
                        {isLoadingData?.[alertInfo.id] ? (<CircularProgress />) : (
                            <Box>
                                {loadedData[alertInfo.id]?.data && <AlertWebsitePreviewGrid gridData={loadedData[alertInfo.id].data} workspaceId={workspaceId} />}
                            </Box>
                        )}
                    </AccordionDetails>
                </Accordion>
            ))}
            <RightDrawer></RightDrawer>
        </>
    )
}