import { h } from 'preact';
import style from './style.less';
import Roster from '../roster';

const url = 'https://staging.app.md.ndb97.nl';

export default class Home extends Component {
	constructor() {
		super();

		this.state = {
			loggedIn: false,
			rosterData: []
		};
		this.handleInput = this.handleInput.bind(this);
		this.login = this.login.bind(this);
		this.renew = this.renew.bind(this);
		this.logout = this.logout.bind(this);
	}

	componentWillMount() {
		const rosterData = JSON.parse(localStorage.getItem('rosterData'));

		if (rosterData !== null) {
			this.setState({
				loggedIn: true,
				rosterData
			});
		}
	}

	logoutFromAPI() {
		fetch(`${url}/logout`, {
			method: 'GET',
			mode: 'cors',
			credentials: 'include'
		})
		.then(_ => null)
		.catch(err => document.querySelector('.error').textContent = err);
	}

	componentWillUnmount() {
		this.logoutFromAPI();
	}

	handleInput(e) {
		if (e.target.name === 'username') {
			this.setState({username: e.target.value});
		} else if (e.target.name === 'password') {
			this.setState({password: e.target.value});
		}
	}

	generateURLEncodedString(creds) {
		/* eslint-disable */
		const formBody = [];
    for (const property in creds) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(creds[property]);
      formBody.push(`${encodedKey}=${encodedValue}`);
    }
    return formBody.join("&");
		/* eslint-enable */
	}

	login(e) {
		if (e) {
			e.preventDefault();
			e.target.querySelector('input[type="submit"]').disabled = true;
		}
		const { username, password } = this.state;

		if (username && password) {
			const creds = { username, password };
			const formBody = this.generateURLEncodedString(creds);

			fetch(`${url}/login`, {
				method: 'POST',
				mode: 'cors',
				credentials: 'include',
				redirect: 'follow',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: formBody
			})
			.then(res => {
				if (res.status === 200) {
					this.setState({loggedIn: true});
					localStorage.clear();

					res.json()
					.then(data => {
						this.setState({rosterData: data});
						localStorage.setItem('rosterData', JSON.stringify(data));
						localStorage.setItem('username', username);
						localStorage.setItem('password', password);

						document.querySelector('.renew').disabled = false;
					})
					.catch(err => document.querySelector('.error').textContent = err);
				} else if (res.status === 401) {
					document.querySelector('.error').textContent = 'Wrong credentials';
				} else {
					document.querySelector('.error').textContent = 'An error occured';
				}
			})
			.catch(_ => console.error('fecking sjit'));
		} else {
			document.querySelector('.error').textContent = 'Please enter credentials';
		}
	}

	renew(e) {
		e.target.disabled = true;

		this.setState({
			rosterData: [],
			username: localStorage.getItem('username'),
			password: localStorage.getItem('password')
		});

		this.logoutFromAPI();
		this.login();
	}
	logout(e) {
		e.target.disabled = true;

		localStorage.clear();
		this.setState({
			loggedIn: false,
			rosterData: []
		});
		this.logoutFromAPI();
	}

	render(props, { loggedIn, rosterData }) {
		return loggedIn
			? (
				<div class={style.home}>
					<div class={style.header}>
						<h1>Roster</h1>
						<div>
							<button class="renew" onClick={this.renew}>Renew</button>
							<button class="logout" onClick={this.logout}>Logout</button>
						</div>
					</div>
					<Roster data={rosterData} />
				</div>
			)
			: (
				<div class={style.login}>
					<h1>Please log in</h1>
					<form onSubmit={this.login} action="javascript:">
						<label>
							Username
							<input type="text" name="username" onChange={this.handleInput} />
						</label>
						<label>
							Password
							<input type="password" name="password" onChange={this.handleInput} />
						</label>
						<input type="submit" />
					</form>
					<p class="error" />
				</div>
			);
	}
}
