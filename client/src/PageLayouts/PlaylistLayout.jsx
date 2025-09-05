import { Outlet } from "react-router";
import { useContext } from "react";
import LoggedContext from "./LoggedContext";
import { PageErrorBoundry } from "../components/Supporting/PageErrorBoundry";

//base layout for Playlist pages
export default function PlaylistLayout() {
  const logged = useContext(LoggedContext);

  return (
    <article> 
      {/* playlist layout */}
      <PageErrorBoundry>
        <Outlet/>
      </PageErrorBoundry>
    </article>
  )
}