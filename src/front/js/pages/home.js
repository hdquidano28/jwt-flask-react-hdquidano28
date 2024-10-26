import React, { useContext } from "react";
import { Context } from "../store/appContext";
import rigoImageUrl from "../../img/rigo-baby.jpg";
import "../../styles/home.css";
import { LoginForm } from "../component/loginForm"

export const Home = () => {
	return (
		<div className="text-center mt-5" >
			<LoginForm />
		</div >

	)
};
