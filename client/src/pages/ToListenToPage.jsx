import { useEffect, useState } from "react"

import TrackCard from "../components/TrackCard"
import NavBtns from "../components/NavBtns"
import PlaylistItemsCard from "../components/PlaylistItemsCard"

export default function ToListenToPage() {

    const [searchValue, setSearchValue] = useState('')
    const [searchResults, setSearchResults] = useState({})
    const [offset, setOffset] = useState(0)
    
    const [toListenTo, setToListenTo] = useState('')
    const [showingPlaylist, setShowingPlaylist] = useState(false)
    const [errFlg, setErrFlg] = useState(false)

    

//Get toListenTo ID
    useEffect(() => {
        fetch(`http://localhost:5000/toListenTo`, 
            {
                credentials: 'include'
            }
        )
        .then( data => {
                data.json()
                .then(data => {
                    console.log('to listen to - id effect data: ', data)
                    if (data.status == 'success') {
                        console.log(data.id)
                        if (data.id) setToListenTo(data.id);
                        else throw Error('Bad Resp Data');
                    } else throw Error('Bad Server Data')
                })
            }
        )
        .catch(err => {
            console.error('Search Error: ', err)
        })
    },[])
    
//getting search reuslts
    useEffect(() => {
        if (searchValue != '') {
            fetch(`http://localhost:5000/search?searchstr=${searchValue}&offset=${offset}`, 
                {
                    credentials: 'include'
                }
            )
            .then( data => {
                    data.json()
                    .then(data => {
                        console.log('toListenTo page-search: ', data)
                        if (data.status == 'success') setSearchResults(data.tracks);
                        else throw Error("Bad Server Error")
                    })
                })
            .catch(err => {
                setErrFlg(true)
                throw Error('Search Error: ', err)
            })
        } 
    }, [searchValue, offset])

    function handleToListenToClick(t) {
        var uri = t.target.value
        var body = JSON.stringify({songURI: t.target.value})

        // console.log('target: ',uri)
        // console.log('body: ', body)
        //422 unprocessable Entity TODO read fastapi docs
        fetch('http://localhost:5000/toListenTo', 
            {
                method:'POST', 
                body: t.target.value,
                credentials: 'include'
            })
        .then(res => {res.json()
            .then(data => {
                console.log('to listen to page: ', data)
                if (data.status == 'success') {
                    alert("Song Addded Successfuly")
                } else {
                    alert("Error Adding song")
                    throw Error('Bad Server Data')
                }
            })})
        .catch(err => console.log(`toListenTo ${t.target.id} error: `, err))
    }

    function handleShowPlaylist(e) {
        if (!showingPlaylist) {
            e.target.innerHTML = "Hide Items"
            setShowingPlaylist(true)
        }else {
            e.target.innerHTML = "Show Items"
            setShowingPlaylist(false)
        }
    }

    //next btn + back Btn
    if (errFlg) throw Error('ToListenTo Page Error')
    return(
        <article>
            <br/>
            
            <div>
                <p className="text-center"><strong>Adding To: </strong>{'toListenTo'}</p>
                {toListenTo != '' && showingPlaylist ? 
                    <PlaylistItemsCard id={toListenTo} toText={false}/>
                     : null
                }
                <button className="text-center" onClick={handleShowPlaylist}>Show Items</button>
            </div>

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
            {searchResults == {} ? null :
            <>
                <ul className="list-group">
                    {!searchResults.items ? null : searchResults.items.map(t =>  
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

                <NavBtns
                    pageSize = {50}
                    offset = {offset}
                    total = {searchResults.total}
                    fwrdFn = {() => {
                        //no total what is end?
                        setOffset(o => o + 50)
                    }}
                    bckwrdFn = {() => {
                        setOffset(o => o-50 < 0 ? 0 : o-50)
                    }}
                />
            </>
            } 
        </article>
    )
}