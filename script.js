import { supabase } from './supabaseClient.js'

window.register = async function () {
  const email = document.getElementById("email").value.trim()
  const pass = document.getElementById("password").value

  const { error } = await supabase.auth.signUp({ email, password: pass })
  if (error) return alert(error.message)

  alert("Registered successfully! Check your email to confirm.")
}

window.login = async function () {
  const email = document.getElementById("email").value.trim()
  const pass = document.getElementById("password").value

  const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
  if (error) return alert(error.message)

  alert("Logged in successfully!")
}

window.logout = async function () {
  await supabase.auth.signOut()
  location.reload()
}

supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    document.getElementById("profile-form").classList.remove("hidden")
    document.getElementById("status-form").classList.remove("hidden")
    document.getElementById("go-dashboard").classList.remove("hidden")
  }
})

window.submitProfile = async function () {
  const name = document.getElementById("name").value.trim()
  const designation = document.getElementById("designation").value.trim()
  const photo = document.getElementById("photo").files[0]
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return alert("Please log in first.")
  if (!name || !designation) return alert("Name and Designation are required.")

  let photoURL = ""

  try {
    if (photo) {
      if (!photo.type.startsWith("image/")) return alert("Only image files are allowed.")
      if (photo.size > 5 * 1024 * 1024) return alert("Max file size is 5MB.")

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(`public/${user.id}.jpg`, photo, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(`public/${user.id}.jpg`)

      photoURL = urlData.publicUrl
    }

    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        name,
        designation,
        photoURL,
        status: {
          Monday: "",
          Tuesday: "",
          Wednesday: "",
          Thursday: "",
          Friday: ""
        }
      })

    if (error) throw error

    alert("Profile saved successfully!")
  } catch (error) {
    console.error("Error saving profile:", error)
    alert("Error submitting profile. Please try again.")
  }
}

window.updateStatus = async function () {
  const day = document.getElementById("day").value
  const status = document.getElementById("status").value

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return alert("Please log in first.")

  try {
    const { data, error: getError } = await supabase
      .from('users')
      .select('status')
      .eq('id', user.id)
      .single()

    if (getError || !data) return alert("User profile not found.")

    const updatedStatus = { ...data.status, [day]: status }

    const { error: updateError } = await supabase
      .from('users')
      .update({ status: updatedStatus })
      .eq('id', user.id)

    if (updateError) throw updateError

    alert("Status updated!")
  } catch (error) {
    console.error("Error updating status:", error)
    alert("Failed to update status.")
  }
}
