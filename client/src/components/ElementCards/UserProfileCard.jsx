import '../../styles/UserpfpCard.css'
import { useEffect, useState } from "react"
import { DataError, FetchError } from '../Supporting/Errors';


export default function UserProfileCard({height, width}) {
    const[errFlg, setErrFlg] = useState({});
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        fetch('http://localhost:5000/user', {credentials: 'include'})
        .then(resp => 
            resp.json()
            .then(data => {
                console.log('home page data: ', data)
                if (data.status == 'success') 
                    setUserInfo(data.user);
                else throw Error('Bad Server Data');
            })
            .catch(err => {
                console.warn('Data Error - getting user profile: ', err)
                setErrFlg({
                    status: true,
                    errType: 'data', 
                    msg: 'Error Getting User Profile'
                })
            })
        )
        .catch(err => {
            console.warn('Fetch Error - getting user profile: ', err)
            setErrFlg({
                status: true,
                errType: 'fetch', 
                msg: 'Error Getting User Profile'
            })
        })
    },[])

    if (Object.keys(errFlg).length > 0 && errFlg.status) {
        switch(errFlg.errType) {
            case('data'):
                throw new DataError(errFlg.msg)
            case('fetch'):
                throw new FetchError(errFlg.msg)
        }
    }

    if (Object.keys(userInfo).length > 0) {
        if (typeof userInfo.images != undefined && Array.isArray(userInfo.images)) 
            userInfo.images.sort((a,b) => b.height*b.width - a.height*a.width); 
        
        return (
            <section id="userInfo" className="text-center userpfpDiv">
                    <img id="userImage" 
                        src={userInfo.images[0] != null ? userInfo.images[0].url : null}
                        className="img-thumbnail"
                        height={height}     
                        width={width}></img>  
                    
                    <div id="userInfoText">
                        <h3 id="userName" className="col" >{userInfo.name !== undefined ? userInfo.name : null}</h3>
                        <a href={userInfo.url !== undefined ? userInfo.url : null} target="_blank" className="col">
                            <h4 id='userID'>{userInfo.id !== undefined ? userInfo.id : null}</h4> 
                        </a>
                    </div> s
                    <p>Follower Count: {userInfo.follower_count}</p>
            </section>
        )
    }

    return <>No UserInfo Data</>
}


//alt fetch
async function fetchData() {
    var resp = await fetch('http://localhost:5000/user', {credentials: 'include'})
    var data = await resp.json()
    console.log('home page data: ', data)
    if (data.status == 'success') return data;
    return
}