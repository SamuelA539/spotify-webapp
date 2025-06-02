import { Link } from "react-router"
import { useContext } from "react"
import { LoggedContext } from "../main"

import '../styles/navbar.css'

export default function NavBar() {
    const logged = useContext(LoggedContext)

    return (
        <nav className="text-center">

            <div className="btn-group">
                <Link to='/home'>
                    <button >Home</button>
                </Link>
                
                <div className="playlistsNav"> <button>Playlists</button>  
                    <ul>
                        <li> <Link to='/playlists/all'>
                            Playlists(all)
                            </Link> </li>

                        <li> <Link to='/playlists/saved'>
                            Saved Songs
                        </Link> </li>
                    </ul> 
                </div>  

                <div className="userNav"> <button>User</button>
                    <ul>
                        <li> <Link to='/profile'>
                            Profile 
                        </Link> </li>
                        <li> <Link to='/profile/topTracks'>
                            topTracks
                        </Link> </li>
                        <li> <Link to='/profile/topArtists'>
                            topArtists
                        </Link>  </li>
                    </ul>
                </div>    

                <Link to='/toListenTo'>
                    <button>toListenTo</button>
                </Link>
                
                {logged ? <Link to='http://localhost:5000/logout'>  <button>Log Out</button>
                        </Link> :null }
            </div>

        </nav>
    )

}