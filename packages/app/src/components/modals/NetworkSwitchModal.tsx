import { Box, Typography, Modal } from "@mui/material";
import NetworkSwitcher from "../NetworkSwitcher";

export interface NetworkSwitchModalProps {
  isOpened: boolean;
  handleClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "100%",
  maxWidth: "400px",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function NetworkSwitchModal({ isOpened, handleClose }: NetworkSwitchModalProps) {
  return (
    <Modal
      open={isOpened}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Choose a network to switch to
        </Typography>
        <NetworkSwitcher />
      </Box>
    </Modal>
  );
}
