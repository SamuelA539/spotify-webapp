import { StrictMode, useContext, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'

//routing imports 
import {createBrowserRouter, Outlet, RouterProvider} from "react-router"

// ---  components  ---
import NavBar from './components/NavBar'

//  --- page components  ---

//stand alone
import HomePage from './pages/HomePage'
import ToListenToPage from './pages/ToListenToPage'
import LoginPage from './pages/LoginPage'
import LoadingPage from './pages/LoadingPage'

//playlist pages
import PlaylistsPage from './pages/PlaylistsPage'
import SavedSongsPage from './pages/SavedSongsPage'

//user pages
import UserPage from './pages/UserPage'
import TopTracksPage from './pages/TopTracksPage'
import TopArtistsPage from './pages/TopArtistsPage'

import { createContext } from "react";

export const LoggedContext = createContext(false)


function BaseLayout() {
  const logged = useContext(LoggedContext);
  const [logState, setLogState] = useState(logged);

//backend logged check
  useEffect(() => {
  fetch("http://localhost:5000/user")
    .then(res => res.json().then(data => {
      if (data.status === 'success') {
        console.log(data)
        setLogState(true)
      }
    }))
    .catch(err => console.error("Root Login error: ", err))
    }, 
  [])

  //logged context passed to 
    return (<>
        <header>
          <nav>
            <NavBar/> 
          </nav>
        </header>
          
          <br/> <br/>

      <main>
        <LoggedContext.Provider value={logState}>  
              <Outlet/>
        </LoggedContext.Provider>
      </main>
    </>) 
  
    
}



function PlaylistLayout() {
  const logged = useContext(LoggedContext);
  const [logState, setLogState] = useState(logged);

//backend logged check
  useEffect(() => {
  fetch("http://localhost:5000/user")
    .then(res => res.json().then(data => {
      if (data.status === 'success') {
        console.log(data)
        setLogState(true)
      }
    }))
    .catch(err => console.error("Root Login error: ", err))
    }, 
  [])

  return (
    <article> 
      Playlist Layout<br/><br/>
      {logged ? <Outlet/> : <LoadingPage/>}
    </article>
  )
}

function UserLayout() {
  const logged = useContext(LoggedContext);
  const [logState, setLogState] = useState(false);

//backend logged check
  useEffect(() => {
  fetch("http://localhost:5000/user")
    .then(res => res.json().then(data => {
      if (data.status === 'success') {
        console.log(data)
        setLogState(true)
      }
    }))
    .catch(err => console.error("Root Login error: ", err))
    }, 
  [])
  
  return (
    <article> 
      User Layout<br/><br/>
      {logged ? <Outlet/> : 
      <LoadingPage/>}   
    </article>
  )
}




const router = createBrowserRouter([
  {
    // path:'/', 
    Component:BaseLayout,
    children: [
      { //login 
        index:true, 
        // path:'login', 
        element:<LoginPage/>
      },

      { //home
        path:'home', 
        element:<HomePage/>
      },

      { //playlists
        path:'playlists', 
        element:<PlaylistLayout/>,
        children: [
          {
            index: true,
            path: '/playlists/saved', 
            element: <SavedSongsPage/>,
          },
          {
            path: '/playlists/all',
            element: <PlaylistsPage/>,
          },  
        ]
      },

      { //user
        path:'profile', 
        element:<UserLayout/>, 
        children: [
          {
            index:true,
            element: <UserPage/>
          },
          {
            path: '/profile/topTracks',
            element: <TopTracksPage/>
          },
          {
            path: '/profile/topArtists',
            element: <TopArtistsPage/>
          },
        ]
      },

      { //toListenTo
        path:'toListenTo', 
        element:<ToListenToPage/>
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
