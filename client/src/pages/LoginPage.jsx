import { useContext } from "react"

export default function LoginPage() {
    return (
      <article>
        <h4 className="text-center">Welcome To Sam's Site</h4> <br/>
        <a href="http://localhost:5000/login"  className="text-center">
            <button>Log In</button>
        </a>
      </article>
    )
}