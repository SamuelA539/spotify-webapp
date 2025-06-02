import { useEffect, useState } from "react"
import LoadingPage from "./LoadingPage"
import TrackCard from "../components/TrackCard"
export default function ToListenToPage() {

    const [searchValue, setSearchValue] = useState('')
    const [searchResults, setSearchResults] = useState({})

    //getting search reuslts
    useEffect(() => {
        if (searchValue != '') {
            fetch(`http://localhost:5000/search?searchstr=${searchValue}`)
            .then( data => {
                    data.json()
                    .then(data => {
                        console.log(data)
                        setSearchResults(data.tracks)
                    })
                }
            )
            .catch(err => {
                console.error('Search Error: ', err)
            })
        }
    }, [searchValue])

    const [playlist, setPlaylists] = useState({})

    //get playlists for user to add to (later feature)
    // useEffect(() => {
    //     fetch('http://localhost:5000/playlists')
    //     .then(res => {
    //         res.json()
    //         .then(data => 
    //             console.log('Playlists: ',data)
    //         )
    //     })
    //     .catch(err => console.error("Playlist fetch error: ", err))

    // }, [])

    function handleToListenToClick(t) {
        var uri = t.target.value
        var body = JSON.stringify({songURI: t.target.value})

        console.log('target: ',uri)
        console.log('body: ', body)
        //422 unprocessable Entity TODO read fastapi docs
        fetch('http://localhost:5000/toListenTo', 
            {
                method:'POST', 
                body: t.target.value
            })
        .then(res => {res.json()
            .then(data => {
                console.log(data)
                if (data == 'success') {
                    alert("Song Addded Successfuly")
                } else {
                    alert("Error Adding song")
                }
            })})
        .catch(err => console.log(`toListenTo ${t.target.id} error: `, err))
    }

    return(
        <article>
            <br/>

            <p className="text-center"><strong>Adding To: </strong>{'toListenTo'}</p>
            {/* Allow (selection||naming) of playlist to add to?*/}

            
            {/* ?add item type selecter? */}
            <section id="searchbarDiv" className="text-center">
                <input type="search" id="toListenToSearchBar"/>
                <button id="toListenToBtn" onClick={() => {
                    let searchbar = document.getElementById('toListenToSearchBar')
                    console.log(searchbar.value)
                    setSearchValue(searchbar.value)
                }}>Search</button>
            </section>
            
            <br/><br/>

            {/* search results ?component?*/}
            {searchResults == null? null :
                <ul className="list-group">
                    {searchResults.items == null ? null : searchResults.items.map(t =>  
                        <li key={t.id} className="list-group-item">
                            <TrackCard track={t}/> 
                            {t.uri == null? null: 
                            <>
                                {/* <form method="POST" action={'http://localhost:5000/toListenTo'}>
                                        <input type="text" name="songURI" id={`${t.id} text`} value={String(t.uri)} required hidden/>
                                        <input type="submit" value="listenToLater"/>
                                        </form> 
                                */}

                                <button id={t.id+' btn'} value={t.uri} onClick={handleToListenToClick}>listenToLater</button>
                            </>
                            }
                        </li>
                    )}
                </ul>
            }
              
        </article>
    )
}