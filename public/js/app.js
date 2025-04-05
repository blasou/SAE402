// URL de base de l'API
const API_BASE_URL = "http://localhost:3000";

// Ajoutez une variable pour le score
let score = 0;

// Variables pour stocker l'état du jeu
let currentGraphData = null;
let simulation = null;
let gameStartTime = null;

// Clé pour la sauvegarde localStorage
const SAVE_KEY = 'movie-actor-game-save';

// Charger les statistiques et afficher dans une fenêtre modale
document.getElementById("load-stats").addEventListener("click", async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    const stats = await response.json();

    // Afficher les statistiques dans une fenêtre modale
    Swal.fire({
      title: "Statistiques",
      html: `
        <p><strong>Nombre de parties jouées :</strong> ${stats.gamesPlayed}</p>
        <p><strong>Temps total de jeu :</strong> ${Math.floor(stats.totalPlayTime / 60)} minutes et ${stats.totalPlayTime % 60} secondes</p>
      `,
      icon: "info",
      confirmButtonText: "Fermer",
    });
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques :", error);
    Swal.fire("Erreur", "Impossible de charger les statistiques.", "error");
  }
});

// Démarrer une nouvelle partie
document.getElementById("start-game").addEventListener("click", async () => {
  try {
    // Réinitialiser le score
    score = 0;
    updateScoreDisplay(); // Met à jour l'affichage du score

    // Réinitialiser le graphe
    const graphContainer = document.getElementById("graph-container");
    graphContainer.innerHTML = ""; // Efface le contenu du graphe

    // Enregistrer le temps de début de la partie
    gameStartTime = Date.now();

    // Démarrer une nouvelle partie avec un acteur aléatoire
    const randomActor = await fetchRandomActor();
    if (!randomActor) return;

    currentGraphData = {
      nodes: [{ id: `actor_${randomActor.id}`, name: randomActor.name, type: "actor" }],
      links: [],
    };

    renderGraph(currentGraphData); // Affiche le graphe avec l'acteur aléatoire

    // Mettre à jour les statistiques (nouvelle partie)
    updateStats(1, 0); // Incrémente le nombre de parties jouées
    
    // Supprimer l'ancienne sauvegarde puisque c'est une nouvelle partie
    supprimerSauvegarde();
    
    // Sauvegarder le nouvel état initial
    sauvegarderPartie();

    Swal.fire("Nouvelle partie", "Une nouvelle partie a commencé !", "success");
  } catch (error) {
    console.error("Erreur lors du démarrage d'une nouvelle partie :", error);
    Swal.fire("Erreur", "Impossible de démarrer une nouvelle partie.", "error");
  }
});

// Fonctions de sauvegarde et chargement
function sauvegarderPartie() {
  try {
    const etatJeu = {
      score: score,
      graphData: currentGraphData,
      startTime: gameStartTime,
      lastSaveTime: Date.now()
    };
    
    localStorage.setItem(SAVE_KEY, JSON.stringify(etatJeu));
    console.log('Partie sauvegardée avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    return false;
  }
}

function chargerPartie() {
  try {
    const sauvegardeBrute = localStorage.getItem(SAVE_KEY);
    
    if (!sauvegardeBrute) {
      console.log('Aucune sauvegarde trouvée');
      return null;
    }
    
    const sauvegarde = JSON.parse(sauvegardeBrute);
    console.log('Partie chargée avec succès');
    return sauvegarde;
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    return null;
  }
}

function supprimerSauvegarde() {
  try {
    localStorage.removeItem(SAVE_KEY);
    console.log('Sauvegarde supprimée');
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return false;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const graphContainer = document.getElementById("graph-container");
  
  // Vérifier s'il existe une sauvegarde et proposer de la charger
  const sauvegarde = chargerPartie();
  
  if (sauvegarde) {
    Swal.fire({
      title: 'Partie sauvegardée',
      text: 'Une partie sauvegardée a été trouvée. Voulez-vous la continuer?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, charger',
      cancelButtonText: 'Non, nouvelle partie'
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Restaurer l'état du jeu
        score = sauvegarde.score;
        currentGraphData = sauvegarde.graphData;
        gameStartTime = sauvegarde.startTime;
        
        // Mettre à jour l'affichage
        updateScoreDisplay();
        renderGraph(currentGraphData);
        
        // Calculer le temps de jeu écoulé depuis le début et ajouter à stats
        const timeElapsed = Math.floor((sauvegarde.lastSaveTime - gameStartTime) / 1000);
        updateStats(0, timeElapsed);
      } else {
        // L'utilisateur préfère une nouvelle partie
        await initializeGraph();
        gameStartTime = Date.now();
        updateStats(1, 0);
      }
    });
  } else {
    // Aucune sauvegarde, démarrer une nouvelle partie
    await initializeGraph();
    gameStartTime = Date.now();
    updateStats(1, 0);
  }

  // Fonction pour récupérer un acteur aléatoire depuis la base de données
  async function fetchRandomActor() {
    try {
      const response = await fetch(`${API_BASE_URL}/actors`);
      const actors = await response.json();

      if (actors.length === 0) {
        Swal.fire("Erreur", "Aucun acteur trouvé dans la base de données.", "error");
        return null;
      }

      // Sélectionner un acteur aléatoire
      const randomIndex = Math.floor(Math.random() * actors.length);
      return actors[randomIndex];
    } catch (error) {
      console.error("Erreur lors de la récupération d'un acteur aléatoire :", error);
      Swal.fire("Erreur", "Impossible de récupérer un acteur aléatoire.", "error");
      return null;
    }
  }

  // Initialisation du graphe avec un acteur aléatoire
  async function initializeGraph() {
    const randomActor = await fetchRandomActor();
    if (!randomActor) return;

    score = 0;
    updateScoreDisplay();
    
    currentGraphData = {
      nodes: [{ id: `actor_${randomActor.id}`, name: randomActor.name, type: "actor" }],
      links: [],
    };

    renderGraph(currentGraphData);
  }

  // Fonction pour afficher le graphe
  function renderGraph(data) {
    if (!data) return;
    
    // Si c'est la première fois qu'on render, ou si on veut tout redessiner
    if (!simulation || !currentGraphData) {
      graphContainer.innerHTML = ""; // Réinitialiser le graphe
      const width = 800;
      const height = 500;

      const svg = d3
        .select("#graph-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      currentGraphData = data;

      simulation = d3
        .forceSimulation(currentGraphData.nodes)
        .force("link", d3.forceLink(currentGraphData.links).id((d) => d.id))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2));

      createVisualElements(svg, simulation);
      
    } else {
      // Mise à jour du graphe existant
      updateGraph(data);
    }
  }

  // Fonction pour créer les éléments visuels du graphe
  function createVisualElements(svg, simulation) {
    // Créer des groupes pour les liens et les nœuds
    const linkGroup = svg.append("g").attr("class", "links");
    const nodeGroup = svg.append("g").attr("class", "nodes");
    
    // Dessiner les liens
    updateLinks(linkGroup);
    
    // Dessiner les nœuds
    updateNodes(nodeGroup);

    // Configurer la simulation
    simulation.on("tick", () => {
      svg.selectAll("line.link")
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      svg.selectAll("circle.node")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);
    });
  }

  // Fonction pour mettre à jour les liens
  function updateLinks(linkGroup) {
    const linkSelection = d3.select(".links")
      .selectAll("line.link")
      .data(currentGraphData.links, d => `${d.source}-${d.target}`);
    
    // Supprimer les liens qui ne sont plus nécessaires
    linkSelection.exit().remove();
    
    // Ajouter de nouveaux liens
    linkSelection.enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke", "#999")
      .attr("stroke-width", 1.5);
  }

  // Fonction pour mettre à jour les nœuds
  function updateNodes(nodeGroup) {
    const nodeSelection = d3.select(".nodes")
      .selectAll("circle.node")
      .data(currentGraphData.nodes, d => d.id);
    
    // Supprimer les nœuds qui ne sont plus nécessaires
    nodeSelection.exit().remove();
    
    // Ajouter de nouveaux nœuds
    const newNodes = nodeSelection.enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", 20)
      .attr("fill", (d) => (d.type === "actor" ? "#6200ea" : d.type === "movie" ? "#03a9f4" : "#4caf50"))
      .on("click", handleNodeClick)
      .call(
        d3.drag()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );
    
    // Ajouter un titre aux nouveaux nœuds
    newNodes.append("title").text(d => d.name);
  }

  // Fonction pour mettre à jour le graphe avec de nouvelles données
  function updateGraph(newData) {
    // Mettre à jour les données
    if (newData.nodes) {
      // Ajouter uniquement les nouveaux nœuds
      newData.nodes.forEach(node => {
        if (!currentGraphData.nodes.some(n => n.id === node.id)) {
          currentGraphData.nodes.push(node);
        }
      });
    }
    
    if (newData.links) {
      // Ajouter uniquement les nouveaux liens
      newData.links.forEach(link => {
        if (!currentGraphData.links.some(l => 
          (l.source.id || l.source) === (link.source.id || link.source) && 
          (l.target.id || l.target) === (link.target.id || link.target))) {
          currentGraphData.links.push(link);
        }
      });
    }
    
    // Mettre à jour la simulation
    simulation.nodes(currentGraphData.nodes);
    simulation.force("link").links(currentGraphData.links);
    
    // Mettre à jour les éléments visuels
    updateLinks();
    updateNodes();
    
    // Redémarrer la simulation
    simulation.alpha(1).restart();

    // Sauvegarder la partie en cours dans la base de données
    saveGameToDatabase();
  }

  // Fonction pour mettre à jour l'affichage du score
  function updateScoreDisplay() {
    const statsContainer = document.getElementById("stats-container");
    statsContainer.innerHTML = `
      <p>Score actuel : ${score}</p>
    `;
  }

  // Gérer le clic sur un nœud
  async function handleNodeClick(event, d) {
    if (d.type === "actor") {
      const { value: movieTitle } = await Swal.fire({
        title: "Quel film cet acteur a-t-il joué ?",
        input: "text",
        inputLabel: `Acteur : ${d.name}`,
        inputPlaceholder: "Entrez le titre du film",
        showCancelButton: true,
      });

      if (movieTitle) {
        const movieData = await checkActorMovieRelation(d.id.replace("actor_", ""), movieTitle);
        if (movieData) {
          Swal.fire("Bravo !", "La réponse est correcte.", "success");
          score += 10; // Augmentez le score pour une bonne réponse
          updateScoreDisplay(); // Mettez à jour l'affichage du score

          const newMovie = { 
            id: `movie_${movieData.id}`, 
            name: movieData.title, 
            type: "movie" 
          };

          updateGraph({
            nodes: [newMovie],
            links: [{ source: d.id, target: newMovie.id }]
          });
          
          // Sauvegarder après chaque modification importante
          sauvegarderPartie();
        } else {
          Swal.fire("Erreur", "La réponse est incorrecte.", "error");
          score -= 5; // Réduisez le score pour une mauvaise réponse
          updateScoreDisplay(); // Mettez à jour l'affichage du score
          
          // Sauvegarder même après une erreur pour conserver le score négatif
          sauvegarderPartie();
        }
      }
    } else if (d.type === "movie") {
      const { value: actorName } = await Swal.fire({
        title: "Quel acteur a joué dans ce film ?",
        input: "text",
        inputLabel: `Film : ${d.name}`,
        inputPlaceholder: "Entrez le nom de l'acteur",
        showCancelButton: true,
      });

      if (actorName) {
        const actorData = await checkMovieActorRelation(d.id.replace("movie_", ""), actorName);
        if (actorData) {
          Swal.fire("Bravo !", "La réponse est correcte.", "success");
          score += 10; // Augmentez le score pour une bonne réponse
          updateScoreDisplay(); // Mettez à jour l'affichage du score

          const newActor = { 
            id: `actor_${actorData.id}`, 
            name: actorData.name, 
            type: "actor" 
          };

          updateGraph({
            nodes: [newActor],
            links: [{ source: d.id, target: newActor.id }]
          });

          // Sauvegarder la partie dans la base de données
          saveGameToDatabase();
        } else {
          Swal.fire("Erreur", "La réponse est incorrecte.", "error");
          score -= 5; // Réduisez le score pour une mauvaise réponse
          updateScoreDisplay(); // Mettez à jour l'affichage du score

          // Sauvegarder même après une erreur pour conserver le score négatif
          saveGameToDatabase();
        }
      }
    }
  }

  // Vérifiez si un acteur a joué dans un film et retournez les détails du film
  async function checkActorMovieRelation(actorId, movieTitle) {
    try {
      const response = await fetch(`${API_BASE_URL}/actors/${actorId}/movies`);
      const movies = await response.json();

      // Chercher le film correspondant
      const matchingMovie = movies.find(movie => 
        movie.title && movie.title.trim().toLowerCase() === movieTitle.trim().toLowerCase()
      );
      
      return matchingMovie || false;
    } catch (error) {
      console.error("Erreur lors de la vérification de la relation acteur-film :", error);
      return false;
    }
  }

  // Vérifiez si un acteur a joué dans un film donné et retournez les détails de l'acteur
  async function checkMovieActorRelation(movieId, actorName) {
    try {
      const response = await fetch(`${API_BASE_URL}/movies/${movieId}/actors`);
      const actors = await response.json();
      
      // Chercher l'acteur correspondant
      const matchingActor = actors.find(actor => 
        actor.name.trim().toLowerCase() === actorName.trim().toLowerCase()
      );
      
      return matchingActor || false;
    } catch (error) {
      console.error("Erreur lors de la vérification de la relation film-acteur :", error);
      return false;
    }
  }

  // Fonction pour mettre à jour les statistiques
  async function updateStats(gamesPlayed = 0, playTime = 0) {
    try {
      await fetch(`${API_BASE_URL}/stats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gamesPlayed, playTime }),
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour des statistiques :", error);
    }
  }

  // Configurer la sauvegarde automatique toutes les 30 secondes
  setInterval(() => {
    if (currentGraphData && currentGraphData.nodes.length > 0) {
      sauvegarderPartie();
      console.log("Sauvegarde automatique effectuée");
    }
  }, 30000);
});

// Ajouter un bouton pour gérer les sauvegardes dans l'interface utilisateur
// À placer où vous le souhaitez dans votre HTML
function ajouterBoutonsSauvegarde() {
  const btnContainer = document.createElement('div');
  btnContainer.className = 'save-buttons';
  btnContainer.style.margin = '10px 0';
  
  // Bouton de sauvegarde manuelle
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Sauvegarder la partie';
  saveBtn.className = 'btn btn-secondary';
  saveBtn.style.marginRight = '10px';
  saveBtn.onclick = () => {
    if (sauvegarderPartie()) {
      Swal.fire({
        title: 'Sauvegarde réussie',
        text: 'Votre partie a été sauvegardée avec succès!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };
  
  // Bouton pour supprimer la sauvegarde
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Supprimer la sauvegarde';
  deleteBtn.className = 'btn btn-danger';
  deleteBtn.onclick = () => {
    Swal.fire({
      title: 'Supprimer la sauvegarde?',
      text: 'Cette action est irréversible!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        if (supprimerSauvegarde()) {
          Swal.fire('Supprimée!', 'La sauvegarde a été supprimée.', 'success');
        }
      }
    });
  };
  
  btnContainer.appendChild(saveBtn);
  btnContainer.appendChild(deleteBtn);
  
  // Ajouter à la page - ajuster le sélecteur selon votre HTML
  const container = document.querySelector('#stats-container') || document.body;
  container.parentNode.insertBefore(btnContainer, container.nextSibling);
}

// Exécuter après le chargement du DOM
document.addEventListener('DOMContentLoaded', ajouterBoutonsSauvegarde);

// Fonction pour récupérer et afficher la liste des parties
async function loadGameList() {
  try {
    const response = await fetch(`${API_BASE_URL}/games`);
    const games = await response.json();

    if (games.length === 0) {
      Swal.fire("Aucune partie", "Aucune partie sauvegardée n'a été trouvée.", "info");
      return;
    }

    // Créer une liste des parties
    const gameOptions = games.map(game => `
      <option value="${game.id}">
        Partie du ${new Date(game.createdAt).toLocaleString()} (Score : ${game.score})
      </option>
    `).join("");

    const { value: selectedGameId } = await Swal.fire({
      title: "Charger une partie",
      input: "select",
      inputOptions: gameOptions,
      inputPlaceholder: "Sélectionnez une partie",
      showCancelButton: true,
    });

    if (selectedGameId) {
      const selectedGame = games.find(game => game.id == selectedGameId);
      loadGameFromDatabase(selectedGame);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des parties :", error);
    Swal.fire("Erreur", "Impossible de charger les parties.", "error");
  }
}

// Fonction pour charger une partie depuis la base de données
function loadGameFromDatabase(game) {
  if (!game) return;

  currentGraphData = game.graphData;
  score = game.score;

  // Recharger le graphe et le score
  renderGraph(currentGraphData);
  updateScoreDisplay();
  console.log("✅ Partie rechargée depuis la base de données :", game);
}

// Ajouter un bouton pour charger une partie
document.getElementById("load-game").addEventListener("click", loadGameList);

// Sauvegarder une partie dans la base de données
async function saveGameToDatabase() {
  try {
    const gameData = {
      score: score,
      graphData: currentGraphData,
    };

    await fetch(`${API_BASE_URL}/games`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gameData),
    });

    console.log("✅ Partie sauvegardée dans la base de données.");
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la partie :", error);
  }
}

// Fonction pour récupérer et afficher le classement
async function updateLeaderboard() {
  try {
    const response = await fetch(`${API_BASE_URL}/leaderboard`);
    const leaderboard = await response.json();

    const leaderboardContainer = document.getElementById("leaderboard-container");
    if (leaderboard.length === 0) {
      leaderboardContainer.innerHTML = "<p>Aucun score disponible pour le moment.</p>";
      return;
    }

    const leaderboardList = leaderboard.map((entry, index) => `
      <li>
        <span>#${index + 1}</span>
        <span>Score : ${entry.score}</span>
        <span>${new Date(entry.createdAt).toLocaleString()}</span>
      </li>
    `).join("");

    leaderboardContainer.innerHTML = `<ul>${leaderboardList}</ul>`;
  } catch (error) {
    console.error("Erreur lors de la récupération du classement :", error);
    const leaderboardContainer = document.getElementById("leaderboard-container");
    leaderboardContainer.innerHTML = "<p>Erreur lors du chargement du classement.</p>";
  }
}

// Mettre à jour le classement toutes les 10 secondes
setInterval(updateLeaderboard, 10000);

// Charger le classement au démarrage
document.addEventListener("DOMContentLoaded", updateLeaderboard);