import { Link } from "react-router"

export default function NavBar() {

    return (
        <>
            <div className="btn-group">
                <Link to='/home'>
                    <button >Home</button>
                </Link>
                
                {/* Drop Down Menu? */}
                <div id="playlist_nav_items">
                    <button onClick={() => {
                        let content = document.getElementById('playlist_nav_items')
                        content.hidden=false
                    }}>Playlists</button>
                     
                    <div id="playlist_nav_items"> 
                        <Link to='/playlists/all'>
                            <button >Playlists(all)</button>
                        </Link><br/>
                        <Link to='/playlists/saved'>
                            <button >Saved Songs</button>
                        </Link>
                    </div>
               
                </div>
                
                

                <Link to='/user/profile'>
                    <button >User</button>
                </Link>  

                <Link to='/user/topTracks'>
                    <button >topTracks</button>
                </Link>  
                <Link to='/user/topArtists'>
                    <button >topArtists</button>
                </Link>      
                
                <Link to='/toListenTo'>
                    <button>toListenTo</button>
                </Link>
            </div>

            <div>
                <Link to='http://localhost:5000/logout'>
                <button>Log Out</button>
                </Link>
            </div>
        </>
    )

}