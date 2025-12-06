import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

/**
 * Function to show/hide the special Craftsman (Tukang) fields.
 * These fields ONLY show if the selected role is 'Tukang'.
 */
window.toggleTukangFields = () => {
    const role = document.getElementById('role_selector').value;
    const tukangFields = document.getElementById('tukang-fields');
    const keahlianInput = document.getElementById('keahlian_tukang');
    const areaLayananInput = document.getElementById('area_layanan');

    if (role === 'Tukang') {
        // Show Craftsman fields
        tukangFields.classList.remove('d-none');
        keahlianInput.required = true;
        areaLayananInput.required = true;
    } else {
        // Hide Craftsman fields
        tukangFields.classList.add('d-none');
        keahlianInput.required = false;
        areaLayananInput.required = false;
    }
};

/**
 * Handles the user registration process and saves data to Firestore.
 */
window.handleRegister = async (e) => {
    e.preventDefault();
    // Gunakan window.isFirebaseInitialized yang diekspos oleh HTML
    if (!window.isFirebaseInitialized) {
        document.getElementById('status-message').textContent = 'Error: Firebase belum siap. Mohon tunggu.';
        document.getElementById('status-message').classList.remove('hidden');
        document.getElementById('status-message').classList.add('text-danger');
        return;
    }

    const statusMessage = document.getElementById('status-message');
    // Pastikan pesan status terlihat dan berwarna biru saat proses
    statusMessage.classList.remove('hidden', 'text-success', 'text-danger', 'text-warning');
    statusMessage.classList.add('text-primary'); 
    statusMessage.textContent = 'Memproses registrasi...';

    const role = document.getElementById('role_selector').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const namaDepan = document.getElementById('nama_depan').value;
    const namaBelakang = document.getElementById('nama_belakang').value;
    const jenisKelamin = document.getElementById('jenis_kelamin').value;
    const alamat = document.getElementById('alamat').value;

    // Collect specific Craftsman data if the role is 'Tukang'
    const keahlian = role === 'Tukang' ? document.getElementById('keahlian_tukang').value : null;
    const areaLayanan = role === 'Tukang' ? document.getElementById('area_layanan').value : null;

    if (role === 'Tukang' && !keahlian) {
        statusMessage.textContent = 'Mohon pilih Keahlian Utama Anda.';
        statusMessage.classList.remove('text-primary');
        statusMessage.classList.add('text-warning');
        return;
    }

    try {
        // 1. Create User Account using Email and Password
        // Menggunakan window.auth (diinisialisasi di HTML)
        const userCredential = await createUserWithEmailAndPassword(window.auth, email, password);
        const user = userCredential.user;
        const userId = user.uid;
        
        // Define collection path (Menggunakan window.appId)
        const userCollection = `users`; 
        const docPath = `/artifacts/${window.appId}/users/${userId}/${userCollection}/${userId}`;

        // 2. Prepare profile data
        const profileData = {
            userId: userId,
            role: role,
            email: email,
            namaLengkap: `${namaDepan} ${namaBelakang}`,
            jenisKelamin: jenisKelamin,
            alamat: alamat,
            createdAt: serverTimestamp(),
        };

        if (role === 'Tukang') {
            profileData.keahlian = keahlian;
            profileData.areaLayanan = areaLayanan;
            profileData.statusVerifikasi = 'Pending'; // Craftsman needs Admin verification
            profileData.rating = 0.0;
        }
        
        // 3. Save profile data to Firestore
        // Menggunakan window.db (diinisialisasi di HTML)
        await setDoc(doc(window.db, docPath), profileData);
        
        statusMessage.textContent = `Registrasi sebagai ${role} berhasil! Anda akan diarahkan ke halaman login.`;
        statusMessage.classList.remove('text-primary');
        statusMessage.classList.add('text-success');

        // Redirect to login page after 3 seconds
        setTimeout(() => {
            statusMessage.textContent = "Simulasi registrasi berhasil! (Redirect diabaikan di Canvas)";
            console.log("Simulation: Redirect to Login page.");
        }, 3000);

    } catch (error) {
        console.error("Registration error:", error);
        let errorMessage = 'Registrasi gagal. ';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage += 'Email sudah terdaftar.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage += 'Password terlalu lemah (minimal 6 karakter).';
        } else {
            errorMessage += 'Terjadi kesalahan sistem.';
        }
        statusMessage.textContent = errorMessage;
        statusMessage.classList.remove('text-primary');
        statusMessage.classList.add('text-danger');
    }
};

// Panggil fungsi toggle untuk memastikan bidang Tukang tersembunyi saat inisialisasi
document.addEventListener('DOMContentLoaded', window.toggleTukangFields);