import { Link } from "react-router-dom";
import Tab from "@mui/material/Tab";

export interface LinkTabProps {
  label: string;
  to: string;
}

export default function LinkTab(props: LinkTabProps) {
  return <Tab component={Link} {...props} />;
}
