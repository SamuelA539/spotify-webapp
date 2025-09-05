import { useContext } from "react"

export default function LoginElement() {
    return (
      <article className="text-center">
        <h4>Welcome To Sam's Site</h4> <br/>
        <a href="http://localhost:5000/login">
            <button>Log In</button>
        </a>
      </article>
    )
}