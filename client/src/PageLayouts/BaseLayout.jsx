import { useContext } from "react";
import { useLoaderData, Outlet } from "react-router";

import LoginElement from "../components/Login";
import LoggedContext from "./LoggedContext";
import NavBar from "../components/BaseElems/NavBar";
import { PageErrorBoundry } from "../components/Supporting/PageErrorBoundry";

//Base layout for pages
export default  function BaseLayout() {
  const logged = useContext(LoggedContext);
  const loaderData = useLoaderData()
  // console.log('Base component loader data: ', loaderData)

  return (
    <LoggedContext.Provider value={loaderData}>  
        <header>
            <NavBar/> 
        </header> <br/>
        <main>
          <PageErrorBoundry>
            {/* <Outlet/> */}
            {loaderData ? <Outlet/> : <LoginElement/>}
          </PageErrorBoundry>
        </main>
    </LoggedContext.Provider>
  ) 
}