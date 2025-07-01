   const token = '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'; // Replace for security!
    const username = 'Anajali5142';
    const repo = 'Data';
    const path = 'data.json';
    
    //const apiUrl = `https://raw.githubusercontent.com/${username}/${repo}/main/${path}`;
     const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;

    let currentData = [];

    // Load and display data
    async function loadData() {
      const res = await fetch(apiUrl, {
        headers: { Authorization: `token ${token}` }
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        alert("❌ Error loading: " + (error.message || res.statusText));
        return { data: [], sha: null };
      }

      const json = await res.json();
      if (!json.content) {
        alert("❌ No content found");
        return { data: [], sha: json.sha || null };
      }

      try {
        const decoded = atob(json.content);
        const data = JSON.parse(decoded);
        const sha = json.sha;
        currentData = data;
        renderTable(data);
        return { data, sha };
      } catch (err) {
        alert("❌ Failed to parse data.");
        return { data: [], sha: null };
      }
    }

    // Save data to GitHub
    async function saveData(updatedData, sha) {
      const updatedContent = btoa(JSON.stringify(updatedData, null, 2));
      return fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${token}`,
        },
        body: JSON.stringify({
          message: "Update JSON data",
          content: updatedContent,
          sha: sha,
        }),
      });
    }

    // Render table
    function renderTable(data) {
      let rows = '';
      data.forEach((item, index) => {
        rows += `<tr>
          <td>${item.name}</td>
          <td>${item.age}</td>
          <td>
            <button onclick="editData(${index})">Edit</button>
            <button onclick="deleteData(${index})">Delete</button>
          </td>
        </tr>`;
      });
      $('#dataBody').html(rows);
    }

    // Form submit (Insert or Update)
    $('#form').on('submit', async function (e) {
      e.preventDefault();
      const name = $('#name').val();
      const age = $('#age').val();
      const editIndex = $('#editIndex').val();

      const { sha } = await loadData();

      if (editIndex === '') {
        // Insert
        currentData.push({ name, age });
      } else {
        // Update
        currentData[editIndex] = { name, age };
        $('#editIndex').val('');
      }

      await saveData(currentData, sha);
      $('#name').val('');
      $('#age').val('');
      loadData();
    });

    // Edit handler
    window.editData = function (index) {
      const item = currentData[index];
      $('#name').val(item.name);
      $('#age').val(item.age);
      $('#editIndex').val(index);
    }

    // Delete handler
    window.deleteData = async function (index) {
      if (!confirm("Are you sure you want to delete this record?")) return;

      const { sha } = await loadData();
      currentData.splice(index, 1); // Remove item
      await saveData(currentData, sha);
      loadData();
    }

    // Load on page load
    loadData();