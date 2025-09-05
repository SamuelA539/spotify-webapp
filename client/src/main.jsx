import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'

//routing imports 
import {createBrowserRouter, RouterProvider} from "react-router"


//  --- pages  ---

import BaseLayout from './PageLayouts/BaseLayout'
import HomeElement from './components/Home'
import ToListenToElement from './components/ToListenTo'
import LoginElement from './components/Login'
import LoadingPage from './pages/LoadingPage'
import FallbackElement from './components/Supporting/FallBackElement'

//playlist pages
import PlaylistLayout from './PageLayouts/PlaylistLayout'
import UserPlaylists from './components/UserPlaylists'
import SavedSongs from './components/SavedSongs'

//user pages
import UserLayout from './PageLayouts/UserLayout'
import UserElement from './components/User'
import TopTracks from './components/TopTracks'
import TopArtists from './components/TopArtists'

import { createContext } from "react";
export const LoggedContext = createContext(false)


// querys userendpoint to check if user is logged
async function clientLoader() {
  //fix try catch
  try 
  { 
    var resp = await fetch("http://localhost:5000/user", {credentials: 'include'})
    var data = await resp.json()
    // console.log('loader data: ', data.logged)
    return data.logged ? data.logged == 'true' : false 
  }
  catch(err) 
  {
    throw err
  }
}


const router = createBrowserRouter(
  [
    {
      // path:'/', 
      Component:BaseLayout,
      loader: clientLoader,
      children: [
        {
          index:true, 
          // path:'login', 
          element:<LoginElement/>   //<HomePage/> 
        },
        { //home
          path:'home', 
          element:<HomeElement/>,
          // HydrateFallback: FallbackElement
        },
        { //playlists
          path:'playlists', 
          element:<PlaylistLayout/>,
          children: [
            {
              index: true,
              path: '/playlists/saved', 
              element: <SavedSongs/>,
            },
            {
              path: '/playlists/all',
              element: <UserPlaylists/>,
            },  
          ]
        },
        { //user
          path:'profile', 
          // element:<UserLayout/>, 
          children: [
            {
              index:true,
              element: <UserElement/>
            },
            {
              path: '/profile/topTracks',
              element: <TopTracks navBtns={true}/>
            },
            {
              path: '/profile/topArtists',
              element: <TopArtists navBtns={true}/>
            },
          ]
        },
        { //toListenTo
          path:'toListenTo', 
          element:<ToListenToElement/>
        },
      ],
    },
  ]
);



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
