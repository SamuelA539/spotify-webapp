import { useEffect, useState } from "react"
import LoadingPage from "./LoadingPage";
import UserProfileCard from "../components/UserProfileCard";

import { useContext } from "react";


export default function HomePage() {
    const [userInfo, setUserInfo] = useState({}); //doesnt need to keep track (not as state?)
    const[userPfp, setUserPfp] = useState({});

    const [logged, setLogged] = useState(false); //== !errflag

    //dependet on Log?
    useEffect( ()=> {
        fetch('http://localhost:5000/user')
        .then(res => {
            res.json()
            .then(data => {
                console.log('data: ', data)
                if (typeof data.Error !== 'undefined') {
                    console.log('error deteced')
                    // throw new Error('User call error: ', data.Error)
                } else {
                    setUserInfo({ //make if case
                        displayName:data.display_name ,
                        id: data.id,
                        // uri: data.uri, //cool info?
                        //followers: data.followers.total
                        url: data.external_urls.spotify,
                    }) 
                    setUserPfp(data.images)
                    setLogged(true)
                }               
            })
            .catch( err => {
                console.warn('JSON conversion Error: ', err)
                setLogged(false)
            })
        })
        .catch(err => { 
            console.warn('Fetch Error: ', err)
            setLogged(false)
        })
     },[]);

    return (
        <article> 
            <section className="text-center">
                <h2 id='HomeTitle'>Welcome To Sam's Spotify Page</h2> <br/>
                <UserProfileCard userInfo={userInfo} userPfps={userPfp}/>   
            </section>
            
            <br/>

            <section id="appDescrip" className="text-center">
                    <h3 id='todoListTitle' className="text-center">Things to Do</h3>
                    <ul id="todoList" className="list-gorup">
                        <li className="list-group-item">Home: Look at your user name</li>
                        <li className="list-group-item">Playlists: see your playlists maybe stuff happens</li>
                        <li className="list-group-item">User: tbh not done yet I cant wait to see either</li>
                    </ul>
                    <p id="appLabel" className="text-center fs-6 font-monospace fw-semibold">This is a cool app please use properly</p>
            </section> 
        </article>
    )
}