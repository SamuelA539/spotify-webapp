import { useEffect, useState } from "react"
import UserProfileCard from "../components/UserProfileCard";

import { useContext } from "react";

//Error Handling
export default function HomePage() {
    const [userInfo, setUserInfo] = useState({});
    const[userPfp, setUserPfp] = useState({});
    const[errFlg, setErrFlg] = useState(false);

    useEffect(() =>{
        async function fetchData() {
            console.log('effect starting ')
            var resp = await fetch('http://localhost:5000/user', 
                {
                    credentials: 'include'
                }
            )
            var data = await resp.json()
            console.log('home page data: ', data)
            if (data.status == 'success') return data;
            return
        }

        fetchData().then(userData => {
            console.log(userData)
            if (userData.id) {
                setUserInfo({
                    displayName: userData.display_name,
                    id: userData.id,
                    followers: userData.followers.total,
                    url: userData.external_urls.spotify,
                }) 
                setUserPfp(userData.images)
            } else setErrFlg(true);
        })
    },[]);

    if (errFlg) throw Error('User Page - user data error');
    return (
        <article> 
            <section className="text-center">
                <h2 id='HomeTitle'>Welcome To Sam's Spotify Page</h2> <br/>
                {userInfo && userPfp ?<UserProfileCard userInfo={userInfo} userPfps={userPfp}/> : "error"}
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