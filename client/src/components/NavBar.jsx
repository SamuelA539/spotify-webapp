import { Link } from "react-router"
import { useContext } from "react"
import { LoggedContext } from "../main"

import '../styles/Navbar.css'

export default function NavBar() {
    const logged = useContext(LoggedContext)
    console.log('nav log: ',logged)

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
                        {/* <Link to='http://localhost:5000/logout'>Logout</Link> */}
                        <p onClick={() => {
                            fetch('http://localhost:5000/logout',
                                {
                                    credentials: 'include'
                                })
                            .then(resp => {
                                resp.json()
                                .then(data => {
                                    console.log('logout data: ', data)
                                    if (data == 'success'){
                                        console.log('logged out');
                                        fetch('http://localhost:5137/')
                                    }//, window.location.reload();
                                    else throw Error('logout error')
                                })
                            })
                            .catch(err=>{console.warn('logout error')})
                        }}>Logout</p>
                    </li>
                    :null}
            </ul>

        </nav>
    )
}