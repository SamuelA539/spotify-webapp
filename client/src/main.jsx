import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'


import HomePage from './pages/HomePage'
import PlaylistsPage from './pages/PlaylistsPage'
import NavBar from './components/NavBar'
import LoginPage from './pages/LoginPage'
import UserPage from './pages/UserPage'
import SavedSongsPage from './pages/SavedSongsPage'
import ToListenToPage from './pages/ToListenToPage'

import {createBrowserRouter, Link, Outlet, RouterProvider} from "react-router"
import TopTracksPage from './pages/TopTracksPage'
import TopArtistsPage from './pages/TopArtistsPage'
import LogoutPage from './pages/LogoutPage'




function Root() {
    return (
      <>
        <NavBar/>
        <div>
          <h1>Root page</h1>
          <Link to="/Home">Home</Link><br/>
          <Link to="/Playlists">Playlists</Link>
        </div>
      </>
    ) 
}

function PlaylistLayout() {
  return (
    <> 
      Playlist Layouts<br/>
      <NavBar/><br/><br/>
      <Outlet/>
    </>
  )
}

function UserLayout() {
  return (
    <> 
      User Layouts<br/>
      <NavBar/><br/><br/>
      <Outlet/>
    </>
  )
}

const router = createBrowserRouter([
  {
    path:'/', 
    Component:LoginPage
  },
  {
    path:'/home', 
    element:<HomePage/>
  },
  {
    path:'/playlists', 
    element:<PlaylistLayout/>,
    children: [
      {
        path: '/playlists/saved', 
        element: <SavedSongsPage/>,
      },
      {
        path: '/playlists/all',
        element: <PlaylistsPage/>,
      },
    ]
  },
  {
    path:'/user', 
    element:<UserLayout/>, 
    children: [
      {
        path: '/user/profile',
        element: <UserPage/>
      },
      {
        path: '/user/topTracks',
        element: <TopTracksPage/>
      },
      {
        path: '/user/topArtists',
        element: <TopArtistsPage/>
      },
    ]
  },
  {
    path:'/toListenTo', 
    element:<ToListenToPage/>
  },
  {
    path:'/logout', 
    element:<LogoutPage/>
  },
]);

//routeing? 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
