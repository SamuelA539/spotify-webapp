import { useEffect, useState } from "react"
import NavBar from "../components/NavBar";
import LoginPage from "./LoginPage";
import LoadingPage from "./LoadingPage";


export default function HomePage() {

    //TODO display images 
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
                        uri: data.uri, //cool info?
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

    if (logged) {
        return (
            <>
            <NavBar/> <br/><br/>
            <h2 id='userInfoTitle' className="text-center"> Welcome To Sam's Spotify Page </h2> <br/>

            <div id="userInfo" className="container text-center">

                <div id="userInfoText"  >
                    <h3 id="userName" className="col" >{userInfo.displayName}</h3>
                    <a href={userInfo.url} target="_blank" className="col">
                        <h4 id='userID'>{userInfo.id}</h4> 
                    </a>
                </div> <br/>

                <img id="userImage" src={userPfp != null ? 
                                        userPfp.length >= 2 ? 
                                            userPfp[1].url
                                            : userPfp[0].url //not len 2+
                                        :null //no images saved
                                        }
                                        class="img-thumbnail"></img>
                                        
            </div> <br/>
    
            <div id="appDescrip" className="appDescription">
                    <h3 id='todoListTitle' className="text-center">Things to Do</h3>
                    <ul id="todoList" className="list-gorup">
                        <li className="list-group-item">Home: Look at your user name</li>
                        <li className="list-group-item">Playlists: see your playlists maybe stuff happens</li>
                        <li className="list-group-item">User: tbh not done yet I cant wait to see either</li>
                    </ul>
                    <p id="appLabel" className="text-center fs-6 font-monospace fw-semibold">This is a cool app please use properly</p>
            </div>
            </>
        )
    } else {
        //loading vs error screen
        return (
            <>
                <div>
                    Home page test
                </div> <br/><br/>
                <LoadingPage/>
            </>
        )
        
    }
}