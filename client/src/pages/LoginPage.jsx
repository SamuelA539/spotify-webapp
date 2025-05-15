import { useEffect, useState } from "react"
import { Link, } from "react-router"


export default function LoginPage() {

        return (
          <>
            <h4>Welcome To Sam's Site</h4> <br/>
            <a href="http://localhost:5000/login">
                <button>Log In</button>
            </a>
          </>
        )
}