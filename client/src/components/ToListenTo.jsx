import { useEffect, useState } from "react"

import TrackCard from "./ElementCards/TrackCard"
import NavBtns from "./BaseElems/NavBtns"
import PlaylistItemsCard from "./ElementCards/PlaylistItemsCard"
import { DataError, FetchError } from "./Supporting/Errors"

export default function ToListenToElement() {
    const [errFlg, setErrFlg] = useState({})

    const [searchValue, setSearchValue] = useState('')
    const [searchResults, setSearchResults] = useState({})
    const [offset, setOffset] = useState(0)
    
    const [toListenTo, setToListenTo] = useState('')
    const [showingPlaylist, setShowingPlaylist] = useState(false)
    

//get toListenTo ID
    useEffect(() => {
        fetch(`http://localhost:5000/toListenTo`, 
            {
                credentials: 'include'
            }
        )
        .then(data => {
            data.json()
            .then(data => {
                console.log('to listen to - id effect data: ', data)
                if (data.status == 'success') {
                    if (!data.id) throw Error('Bad Resp Data'); //syntax error
                    else setToListenTo(data.id);
                } else throw Error('Bad Server Data');  //syntax error
            })
            .catch (err => {
                console.warn('Data Error - getting toListenTo: ', err)
                setErrFlg({
                    status: true,
                    errType: 'data', 
                    msg: 'Error Getting toListenTo Info'
                })
            })
        })
        .catch(err => { //fetch error
            console.warn('Fetch Error - getting toListenTo: ', err)
            setErrFlg({
                status: true,
                errType: 'fetch', 
                msg: 'Error Getting toListenTo Info'
            })
        })
    },[])
    
//getting search reuslts
    useEffect(() => {
        if (searchValue != '') {
            fetch(`http://localhost:5000/search?searchstr=${searchValue}&offset=${offset}`, {credentials: 'include'})
            .then(data => {
                data.json()
                .then(data => {
                    console.log('toListenTo page-search: ', data)
                    if (data.status == 'success') setSearchResults(data.tracks);
                    else throw Error("Bad Server Data")
                })
                .catch(err => {
                    console.warn('Data Error - getting search results: ', err)
                    setErrFlg({
                        status: true,
                        errType: 'data', 
                        msg: 'Error Getting Search Results'
                    })
                })
            })
            .catch(err => {
                console.warn('Fetch Error - getting search results: ', err)
                setErrFlg({
                    status: true,
                    errType: 'fetch', 
                    msg: 'Error Getting Search Results'
                })
            })
        } 
    }, [searchValue, offset])

//Adds track to toListenTo playlist
    //TODO error handling
    function handleToListenToClick(t) {
        var uri = t.target.value
        var body = JSON.stringify({songURI: t.target.value})

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
                    alert("Error Saving song")
                    throw Error('Bad Server Data')
                }
            })})
        .catch(err => console.log(`toListenTo ${t.target.id} error: `, err))
    }

//Shows tracks in toListenTo playlist
    //TODO error handling
    function handleShowPlaylist(e) {
        if (!showingPlaylist) {
            e.target.innerHTML = "Hide Items"
            setShowingPlaylist(true)
        }else {
            e.target.innerHTML = "Show Items"
            setShowingPlaylist(false)
        }
    }

    if (Object.keys(errFlg).length > 0 && errFlg.status) {
        switch(errFlg.errType) {
            case('data'):
                throw DataError(errFlg.msg)
                break
            case('fetch'):
                throw FetchError(errFlg.msg)
                break
        }
    }

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
            {Object.keys(searchResults) <= 0 ? null :
            <>
                <ul className="list-group">
                    {!searchResults.items ? null : searchResults.items.map(t =>  
                        <li key={t.id} className="list-group-item">
                            <TrackCard track={t} height={125} width={125}/> 
                            {t.uri != null ? 
                                <button id={t.id+' btn'} value={t.uri} onClick={handleToListenToClick}>listenToLater</button>
                            :null}
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