const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			login: [],
			signup: [],
			logout: [],
			token: null,
			isAuthenticated: false
		},
		actions: {
			// Use getActions to call a function within a fuction
			getLogin: async (email, password) => {
				try {
					// fetching data from the backend
					const response = await fetch(`https://opulent-disco-69rg49pr7rj72xxx4-3001.app.github.dev/api/login`, {
						method: "POST",
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
						},
						body: JSON.stringify({ email, password })
					})

					if (!response.ok) {
						throw new Error("User does not exists")
					}

					const data = await response.json();

					if (data.token) {
						setStore({ isAuthenticated: true, token: data.token, message: data.message })
					} else {
						throw new Error("Invalid login data")
					}
					// don't forget to return something, that is how the async resolves
					return data;
				} catch (error) {
					console.log("Error loading message from backend", error);
					return { error: error.message }
				}
			},

			getSignUp: async (email, password) => {
				try {
					// fetching data from the backend
					const response = await fetch(`https://opulent-disco-69rg49pr7rj72xxx4-3001.app.github.dev/api/signup`, {
						method: "POST",
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': "*",
						},
						body: JSON.stringify({ email, password })
					})

					if (!response.ok) {
						throw new Error("User already exists")
					}
					const data = await response.json();
					setStore({ message: data.message })
					// don't forget to return something, that is how the async resolves
					return data;
				} catch (error) {
					console.log("Error loading message from backend", error);
					return { error: error.message }
				}
			},

			login: async () => {
				setStore({ isAuthenticated: true })
			},

			logout: async () => {
				const store = getStore();
				const token = store.token;

				if (token) {
					try {
						const response = await fetch(`https://opulent-disco-69rg49pr7rj72xxx4-3001.app.github.dev/api/logout`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								'Authorization': `Bearer ${token}` //Envia el token para autenticar solicitudes en el server.
							}
						});
						if (!response.ok) {
							throw new Error("Logout failed")
						}
						console.log("Token invalidate on backend")
					} catch (error) {
						console.log("Error during logout", error)
					}
				}
				setStore({ isAuthenticated: false, token: null, message: "Logout successful" })

				console.log("Token removed, user logged out successfully");

			},
		}
	};
};

export default getState;
