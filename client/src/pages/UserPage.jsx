import { useEffect, useState } from "react";
import ArtistCard from "../components/ArtistCard";
import TrackCard from "../components/TrackCard";
import UserProfileCard from "../components/UserProfileCard";

export default function UserPage() {
    const [userInfo, setUserInfo] = useState({});
    const [userPfp, setUserPfp] = useState({});
    
    //get userPFp data
    useEffect( ()=> {
            fetch('http://localhost:5000/user')
            .then(res => {
                res.json()
                .then(data => {
                    console.log('data: ', data)
                    if (typeof data.Error !== 'undefined') {
                        console.log('error deteced')
                        throw new Error('User call error: ', data.Error)
                    } else {
                        setUserInfo({ //make if case
                            displayName:data.display_name,
                            id: data.id,
                            email: data.email,
                            href:data.external_urls.spotify,
                            followerCount: data.followers.total,
                            url: data.external_urls.spotify,
                        }) 
                        // console.log('no error')
                        setUserPfp(data.images)
                    }               
                })
                .catch( err => {
                    setErrFlg(true)
                    console.warn('JSON conversion Error: ', err)
                })
            })
            .catch(err => {
                setErrFlg(true)
                console.warn('Fetch Error: ', err)
            })
    }, []);


    
    //top Artist effect
    const [showTopArtsits, setShowTopArtsits] = useState(false);
    const [topArtists, setTopArtists] = useState({})
    const[topArtistsTerm, setTopArtistsTerm] = useState("short")
    useEffect(() => {
        //offset + limit < total
        fetch(`http://localhost:5000/topArtists?term=${topArtistsTerm}&limit=${20}&offset=${0}`)
        .then(res => 
            res.json()
            .then(data => {
                    // console.log('Top Artist data: ', data)
                    setTopArtists(data.items)
            })
            .catch(err => console.log('Data Error: ', err))
        )
        .catch(err => console.log('Fetch Error: ', err))
    }, [showTopArtsits, topArtistsTerm])

    function handleArtistTermChange(btn) {
        console.log("Selected: ", btn.target.value)
        setTopArtistsTerm(btn.target.value)
    }

    //top Tracks effect
    const [showTopTracks, setShowTopTracks] = useState(false);
    const [topTracks, setTopTracks] = useState({})
    const[topTracksTerm, setTopTracksTerm] = useState('short')
    useEffect(() => {
        //offset + limit < total
        fetch(`http://localhost:5000/topTracks?term=${topTracksTerm}&limit=${20}&offset=${0}`)
        .then(res => 
            res.json()
            .then(data => {
                    // console.log('Top Track data: ', data)
                    setTopTracks(data.items)
            })
            .catch(err => console.log('Data Error: ', err))
        )
        .catch(err => console.log('Fetch Error: ', err))
    }, [showTopTracks, topTracksTerm])

    function handleTrackTermChange(btn) {
        console.log('Selected: ', btn.target.value)
        setTopTracksTerm(btn.target.value)
    }


    return (
        <article>
            <h3 className="text-center">Profile Page</h3>

            <article>    
                <section className="text-center">
                    <UserProfileCard userInfo={userInfo} userPfps={userPfp}/>
                    <p>Follower Count: {userInfo.followerCount}</p>
                </section> <hr/>

                <article id="top20Artists">
                    <section className="btn-group">
                        <button id="showTopArtistsBtn" onClick={() => {
                            // document.getElementById('topArtistsList') //hide elem?
                            setShowTopArtsits(val => !val)
                            if (showTopArtsits) {
                                document.getElementById('showTopArtistsBtn').innerHTML= 'Show Top 20 Artists'
                                setShowTopTracks(false)
                            }else {
                                document.getElementById('showTopArtistsBtn').innerHTML= 'Hide Artists'
                            }
                        }} className="btn btn-outline-primary">Show Top 20 Artists</button>

                        <a href="/user/topArtists"><button className="btn btn-outline-primary">See All Top Artists</button></a>
                    </section>

                    {showTopArtsits?
                        <ol id="topArtistsList" className="list-group list-group-numbered">  
                            <p>Select Time Period</p>
                            <form onChange={handleArtistTermChange}>
                                <input type="radio" id="shortArtist" name="topArtistsTerm" value="short" />
                                <label htmlFor="shortArtist">Short</label>

                                <input type="radio" id="medArtist" name="topArtistsTerm" value="medium"/>
                                <label htmlFor="medArtist">Medium</label>

                                <input type="radio" id="longArtist" name="topArtistsTerm" value="long"/>
                                <label htmlFor="longArtist">Long</label>
                            </form> <hr/>

                                {typeof topArtists != 'undefined' && topArtists.length > 0?
                                    topArtists.map(art => <li key={art.id} className="list-group-item"><ArtistCard artist={art}/></li>)
                                    :null
                                }
                         </ol>
                    :null}

                </article>
                
                <br/><hr/><br/>

                <article id="top20Tracks">
                    <section className="btn-group">
                        <button id="showTopTracksBtn" onClick={() => {
                            // document.getElementById('topArtistsList') //hide elem?
                            setShowTopTracks(val => !val)
                            if (showTopTracks) {
                                document.getElementById('showTopTracksBtn').innerHTML= 'Show Top 20 Tracks'
                                setShowTopArtsits(false)
                            }else {
                                document.getElementById('showTopTracksBtn').innerHTML= 'Hide Tracks'
                            }
                        }} className="btn btn-outline-primary">Show Top 20 Tracks</button>
                        <a href="/user/topTracks"><button className="btn btn-outline-primary">See All Top Tracks</button></a>
                    </section>

                    {showTopTracks?
                        <ol id="topTracksList"> 
                            <p>Select Time Period</p>
                            <form onChange={handleTrackTermChange}>
                                <input type="radio" id="shortTerm" name="topTracksTerm" value="short" className="form-check-input"/>
                                <label htmlFor="shortTerm" className="form-check-label">Short</label>

                                <input type="radio" id="medTerm" name="topTracksTerm" value="medium" className="form-check-input"/>
                                <label htmlFor="medTerm" className="form-check-label">Medium</label>

                                <input type="radio" id="longTerm" name="topTracksTerm" value="long" className="form-check-input"/>
                                <label htmlFor="longTerm" className="form-check-label">Long</label>
                            </form> <hr/>

                            {typeof topTracks != 'undefined' && topTracks.length > 0?
                                topTracks.map(t => <li key={t.id}><TrackCard track={t}/></li>)
                                :null
                            }
                        </ol>
                    :null}
                </article>
                      
            </article>
        </article>
    )
    
}