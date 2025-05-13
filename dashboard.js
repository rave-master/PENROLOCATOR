import { supabase } from './supabaseClient.js'

supabase.auth.getUser().then(({ data: { user }, error }) => {
  if (user) {
    loadDashboard()
  } else {
    alert("You must be logged in to view the dashboard.")
    window.location.href = "index.html"
  }
})

window.logout = async function () {
  await supabase.auth.signOut()
  window.location.href = "index.html"
}

window.loadDashboard = async function () {
  const table = document.getElementById("staff-table")
  const search = document.getElementById("search").value.trim().toLowerCase()
  table.innerHTML = ""

  try {
    const { data, error } = await supabase.from('users').select('*')
    if (error) throw error

    data.forEach((user) => {
      if (!user.name.toLowerCase().includes(search)) return

      const row = `
        <tr>
          <td><img src="${user.photoURL || 'https://via.placeholder.com/50'}" class="w-12 h-12 rounded-full mx-auto" /></td>
          <td>${user.name}</td>
          <td>${user.designation}</td>
          <td>${user.status?.Monday || ""}</td>
          <td>${user.status?.Tuesday || ""}</td>
          <td>${user.status?.Wednesday || ""}</td>
          <td>${user.status?.Thursday || ""}</td>
          <td>${user.status?.Friday || ""}</td>
        </tr>`
      table.innerHTML += row
    })
  } catch (error) {
    console.error("Error loading dashboard:", error)
    alert("Could not load dashboard.")
  }
}
