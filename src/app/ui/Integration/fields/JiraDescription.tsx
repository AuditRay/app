import {FormControl, InputLabel} from "@mui/material";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import {
    MenuButtonBold,
    MenuButtonItalic,
    MenuControlsContainer,
    MenuDivider,
    MenuSelectHeading,
    RichTextEditor,
    type RichTextEditorRef,
} from "mui-tiptap";
import StarterKit from "@tiptap/starter-kit";
import * as React from "react";
import {RefObject} from "react";

export default function JiraDescription({ticketHtml, isAiLoading, rteRef}: {ticketHtml: string, isAiLoading: boolean, rteRef: RefObject<RichTextEditorRef>}) {
  return (
      <FormControl margin={'dense'} fullWidth >
          <InputLabel id="jira-content-label">Description</InputLabel>
          <Box sx={{mt: 2}}>
              {isAiLoading ? (
                  <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px'}}>
                      <CircularProgress />
                  </Box>
              ) : (
                  <RichTextEditor
                      ref={rteRef}
                      extensions={[StarterKit]} // Or any Tiptap extensions you wish!
                      content={ticketHtml} // Initial content for the editor
                      // Optionally include `renderControls` for a menu-bar atop the editor:
                      renderControls={() => (
                          <MenuControlsContainer>
                              <MenuSelectHeading />
                              <MenuDivider />
                              <MenuButtonBold />
                              <MenuButtonItalic />
                              {/* Add more controls of your choosing here */}
                          </MenuControlsContainer>
                      )}
                  />
              )}
          </Box>
      </FormControl>
  );
}