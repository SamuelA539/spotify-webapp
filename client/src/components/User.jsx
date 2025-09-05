import { useEffect, useState } from "react";

import UserProfileCard from "./ElementCards/UserProfileCard";
import TopArtists from "./TopArtists";
import TopTracks from "./TopTracks";

import { PageErrorBoundry } from "./Supporting/PageErrorBoundry";

export default function UserElement() {
    const [showTopArtsits, setShowTopArtsits] = useState(false);
    const [showTopTracks, setShowTopTracks] = useState(false);


    return (
        <article>
            <h3 className="text-center">Profile Page</h3>

            <article>    
                <PageErrorBoundry>
                    <UserProfileCard height={150} width={150}/>
                </PageErrorBoundry>
                 
                <hr/>

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
                        <a href="/profile/topArtists"><button className="btn btn-outline-primary">See All Top Artists</button></a>
                    </section>
                    {showTopArtsits ? <TopArtists/> : null}         
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
                        <a href="/profile/topTracks"><button className="btn btn-outline-primary">See All Top Tracks</button></a>
                    </section>
                    {showTopTracks? <TopTracks/> : null}
                </article>        
            </article>
            
        </article>
    )
    
}