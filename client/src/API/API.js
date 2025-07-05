const URI = 'http://localhost:3001/api'

async function logIn(credentials){
    const bodyObject = {
        email: credentials.email,
        password: credentials.password
    }
    const response = await fetch(URI + `/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(bodyObject)
    })
    if (response.ok) {
        const user = await response.json();
        return user;

    } else {
        const err = await response.text()
        throw err;
    }
}

async function logout() {
    const response = await fetch(URI + `/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    if (response.ok)
        return null;
}

async function getCurrentUser() {
  const res = await fetch(URI + '/session/current', {
    credentials: 'include'
  });

  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export { logIn, logout, getCurrentUser };