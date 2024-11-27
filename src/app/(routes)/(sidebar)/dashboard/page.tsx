'use client'
import * as React from "react";
import {Box, Paper} from "@mui/material";
import Grid from '@mui/material/Grid2';
import Typography from "@mui/material/Typography";
import {userSessionState} from "@/app/lib/uiStore";
import {getWorkspacesDashboard, workspaceDashboardReturn} from "@/app/actions/workspaceActions";
import CircularProgress from "@mui/material/CircularProgress";
import {BarChart, Gauge, gaugeClasses, PieChart} from "@mui/x-charts";
import theme from "@/theme";

type Data = workspaceDashboardReturn & {
    pieChart: any;
    barChart: any;
    securityIndex: number;
}
export default function Dashboard() {
  const [data, setData] = React.useState<Data[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const sessionFullUser = userSessionState((state) => state.fullUser);
  React.useEffect(() => {
    const getData = async () => {
      const workspacesData: Data[] = [];
      const data = await getWorkspacesDashboard();
      for (const datum of data) {
        const workspaceData: Data = {
          ...datum,
          pieChart: [],
          barChart: [],
          securityIndex: 0,
        };
        workspaceData.securityIndex = workspaceData.statistics.securityIndex;
        const pieChart: {id: number, value: number, label: string}[] = [];
        for (const pieChartKey in workspaceData.statistics.frameworkVersions) {
          pieChart.push({
            id: pieChart.length,
            value: workspaceData.statistics.frameworkVersions[pieChartKey],
            label: pieChartKey,
          });
        }
        workspaceData.pieChart = pieChart;
        workspaceData.barChart = [
          workspaceData.statistics.status.updated,
          workspaceData.statistics.status.withUpdates + workspaceData.statistics.status.withSecurityUpdates,
          workspaceData.statistics.status.withSecurityUpdates,
          workspaceData.statistics.status.notSupported,
          workspaceData.statistics.status.unknown,
        ];
        workspacesData.push(workspaceData);
      }
      setData(workspacesData);
      setIsLoading(false);
    }
    getData().then();
  }, []);
  return (
    <>
        {isLoading ? (
          <Box sx={{my: 2, height: "100%", width: "100%", display: "flex", alignItems: 'center', justifyContent: 'center'}}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Chart */}
            {data && data.map((workspaceData) => (
                <Box key={workspaceData.workspace.id} sx={{my: 2}}>
                  <Grid container spacing={3}>
                      <Grid size={12}>
                          <Paper
                              sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                              }}
                          >
                            <Box sx={{p: 2}}>
                              <Typography variant={'h1'}>{workspaceData.workspace.name}</Typography>
                            </Box>
                            {!isLoading && (
                                <Grid container spacing={2} sx={{p: 3}}>
                                  <Grid size={4}>
                                    <Paper
                                        sx={{
                                          p: 2,
                                          display: 'flex',
                                          flexDirection: 'column',
                                          height: 240,
                                        }}
                                    >
                                      {workspaceData.barChart && (
                                          <BarChart
                                              borderRadius={10}
                                              xAxis={[
                                                {
                                                  id: 'barCategories',
                                                  data: ['Updated', 'Needs Update', 'Not Secure', 'Not Supported', 'Unknown'],
                                                  scaleType: 'band',
                                                  labelStyle: {
                                                    fontSize: 5,
                                                  },
                                                  colorMap: {
                                                    type: 'ordinal',
                                                    colors: ['green', 'orange', 'red', 'darkkhaki', 'gray'],
                                                  }
                                                },
                                              ]}
                                              series={[
                                                {
                                                  data: workspaceData.barChart,
                                                },
                                              ]}
                                          />
                                      )}
                                    </Paper>
                                  </Grid>
                                  <Grid size={4}>
                                    <Paper
                                        sx={{
                                          p: 2,
                                          display: 'flex',
                                          flexDirection: 'column',
                                          height: 240,
                                        }}
                                    >
                                      <PieChart
                                          series={[
                                            {
                                              data: workspaceData.pieChart || [],
                                              innerRadius: 30,
                                              outerRadius: 100,
                                              paddingAngle: 5,
                                              cornerRadius: 5,
                                              startAngle: -45,
                                            },
                                          ]}
                                      />
                                    </Paper>
                                  </Grid>
                                  <Grid size={4}>
                                    <Paper
                                        sx={{
                                          p: 2,
                                          display: 'flex',
                                          flexDirection: 'column',
                                          height: 240,
                                        }}
                                    >
                                      <Gauge
                                          value={workspaceData.securityIndex}
                                          startAngle={-110}
                                          endAngle={110}
                                          cornerRadius="50%"
                                          sx={{
                                            [`& .${gaugeClasses.valueText}`]: {
                                              fontSize: 15,
                                              transform: 'translate(0px, 0px)',
                                            },
                                            [`& .${gaugeClasses.valueArc}`]: {
                                              fill: 'red',
                                            },
                                            [`& .${gaugeClasses.referenceArc}`]: {
                                              fill: theme.palette.text.disabled,
                                            },
                                          }}
                                          text={
                                            ({ value, valueMax }) => `Security Index ${value}%`
                                          }
                                      />
                                    </Paper>
                                  </Grid>
                                </Grid>
                            )}
                          </Paper>
                      </Grid>
                  </Grid>
                </Box>
            ))}
          </>
        )}
    </>
  );
}
