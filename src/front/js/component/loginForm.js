import React, { useEffect, useState, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

export const LoginForm = () => {

    const { store, actions } = useContext(Context);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('')
    const [alertMessage, setAlertMessage] = useState(null)
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setAlertMessage("Email and password are required!")
            console.error("Email and password are required.")
        }
        const result = await actions.getLogin(email, password);
        console.log(result)

        if (result && result.error === "User does not exists") {
            setAlertMessage("User does not exists")
        } else if (result && result.message) {
            actions.login();
            console.log("Usuario autenticado");
            navigate('/loginSuccess');
        }
    }

    return (
        <div>
            {alertMessage && (
                <div className="alert alert-warning alert-dismissible fade show" role="alert">
                    {alertMessage}
                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={() => setAlertMessage(null)}
                    ></button>
                </div>
            )}


            <form onSubmit={handleSubmit}>
                <div className="container">
                    <div>
                        <h1>LOGIN</h1>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="inputEmail" className="form-label">Email address</label>
                        <input type="email" className="form-control" id="inputEmail" aria-describedby="emailHelp" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="inputPassword" className="form-label">Password</label>
                        <input type="password" className="form-control" id="inputPassword" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary">Login</button>
                </div>
            </form>
        </div>
    )
};