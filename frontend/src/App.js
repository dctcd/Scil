import {Box, Drawer, Hidden, Stack, useTheme} from "@mui/material";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Home from "./Home";
import Project from "./Project";
import React, {useEffect, createContext} from "react";

export const SidebarContext = createContext(false);
export const TabContext = createContext("Home");
export const ProjectContext = createContext({});

function App() {
    const theme = useTheme();
    const [sidebarOpen, setSidebarOpen] = React.useState(window.innerWidth >= theme.breakpoints.values.md);
    const [tab, setTab] = React.useState("Home");
    const [project, setProject] = React.useState("");
    const [sidebarStyle, setSidebarStyle] = React.useState(window.innerWidth >= theme.breakpoints.values.md ? "persistent" : "temporary");
    const container = undefined;
    const handleDrawerToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleWindowSizeChange = () => {
        if (window.innerWidth >= theme.breakpoints.values.md) {
            setSidebarStyle("persistent");
            setSidebarOpen(true);
        } else {
            setSidebarStyle("temporary");
            setSidebarOpen(false);
        }
    };

    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        };
    }, []);

    return (
        <SidebarContext.Provider value={{sidebarOpen, setSidebarOpen}}>
            <TabContext.Provider value={{tab, setTab}}>
                <ProjectContext.Provider value={{project, setProject}}>
                    <div>
                        <Drawer
                            container={container}
                            variant={sidebarStyle}
                            anchor="left"
                            open={sidebarOpen}
                            onClose={handleDrawerToggle}
                            ModalProps={{
                                keepMounted: true
                            }}>
                            <Sidebar/>

                        </Drawer>
                        <Stack direction="row">
                            <Hidden mdDown implementation="css">
                                <Box p={2} sx={{width: "165px"}}></Box>
                            </Hidden>
                            <Stack flexGrow={1} flexDirection="column">
                                <Header title={tab}/>
                                {tab === "Home" && <Home project={project}/>}
                                {tab === "Project" && <Project project={project}/>}
                            </Stack>
                        </Stack>
                    </div>
                </ProjectContext.Provider>
            </TabContext.Provider>
        </SidebarContext.Provider>
    );
}

export default App;
