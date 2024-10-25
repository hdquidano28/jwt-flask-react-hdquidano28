import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext"
import { useNavigate } from "react-router-dom";


export const Navbar = () => {

	const { store, actions } = useContext(Context);
	const navigate = useNavigate();

	const handleLogout = async () => {
		await actions.logout()
		navigate("/")
	};

	return (
		<div className="container">
			<nav className="navbar navbar-light bg-light">
				<div className="container justify-content-md-end">
					{store.isAuthenticated ? (
						<button className="btn btn-danger" onClick={handleLogout}>
							Logout
						</button>
					) : (

						<div className="ml-auto">
							<Link to="/signupForm">
								<button className="btn btn-primary">Signup</button>
							</Link>
						</div>
					)}

				</div>
			</nav>
		</div>
	);
};
