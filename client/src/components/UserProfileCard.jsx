import '../styles/UserpfpCard.css'

export default function UserProfileCard({userInfo, userPfps, size=150}) {

    if (userPfps) {
        
        if (Array.isArray(userPfps)) {
            //userPfps.sort((a,b) => a.height-b.height) //check objs are real images
            var bestImg = userPfps[0];
            for (var i of userPfps) {
                if (size - bestImg.height > size - i.height) bestImg = i;
            }
        }
    }

    return (
        <section id="userInfo" className="text-center userpfpDiv">
                <img id="userImage" 
                    src={bestImg != null ? bestImg.url : null}
                    className="img-thumbnail"
                    height={size}     
                    width={size}></img>  
                
                <div id="userInfoText">
                    <h3 id="userName" className="col" >{userInfo.displayName !== undefined ? userInfo.displayName : null}</h3>
                    <a href={userInfo.url !== undefined ? userInfo.url : null} target="_blank" className="col">
                        <h4 id='userID'>{userInfo.id !== undefined ? userInfo.id : null}</h4> 
                    </a>
                </div> 
        </section>
    )

}