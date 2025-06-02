
export default function UserProfileCard({userInfo, userPfps}) {
    // console.log("Info ",{} === userInfo)
    // console.log("Pfps ", typeof userPfps)


    return (
        <section id="userInfo" className="container text-center">

                <div id="userInfoText">
                    <h3 id="userName" className="col" >{userInfo.displayName !== undefined ? userInfo.displayName : null}</h3>
                    <a href={userInfo.url !== undefined ? userInfo.url : null} target="_blank" className="col">
                        <h4 id='userID'>{userInfo.id !== undefined ? userInfo.id : null}</h4> 
                    </a>
                </div> <br/>

                <img id="userImage" src={userPfps[0] != null ? 
                                            userPfps.length >= 2 ? 
                                                userPfps[1].url !== undefined ? userPfps[1].url : null
                                                : userPfps[0].url !== undefined ? userPfps[0].url : null //not len 2+
                                            :null //no images saved
                                        }
                                        className="img-thumbnail"></img>                    
        </section>
    )

}