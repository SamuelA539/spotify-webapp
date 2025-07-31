import { Link } from "react-router"
import { useContext } from "react"
import { LoggedContext } from "../main"

import '../styles/Navbar.css'

export default function NavBar() {
    const logged = useContext(LoggedContext)

    return (
        <nav className="text-center">

            <ul className="mainMenu">
                <li>
                    <Link to='/home'>Home</Link> 
                </li>
                
                <li> 
                    <Link to='/playlists/all'>Playlists</Link>
                    <ul>
                        <li><Link to='playlists/saved'>Saved Songs</Link></li>
                    </ul>
                </li>

                <li>
                    <Link to='/profile'>Profile</Link>
                    <ul>
                        <li><Link to='/profile/topArtists'>Top Artists</Link></li>
                        <li><Link to='/profile/topTracks'>Top Tracks</Link></li>
                    </ul>
                </li>
                
                <li>
                    <Link to='/toListenTo'>To Listen To</Link>
                </li>

                {logged ? 
                    <li>
                        <Link to='http://localhost:5000/logout'>Logout</Link>
                    </li>
                    :null}
            </ul>
        </nav>
    )
}