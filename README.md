# Observatoire des Condamnations des Élus Français

Cette application web interactive permet de visualiser les condamnations pénales des députés et sénateurs français sur l'hémicycle de leurs chambres respectives.

## Fonctionnalités

- **Représentation Interactive** : Visualisation des sièges de l'Assemblée Nationale (577) et du Sénat (348).
- **Code Couleur** : Les élus sont colorés selon leur groupe politique.
- **Indicateurs de Condamnations** : Les élus condamnés sont entourés d'anneaux rouges concentriques. Plus il y a d'anneaux, plus l'élu a de condamnations recensées.
- **Détails au Clic** : Cliquez sur un siège pour voir le détail des condamnations (type, année, description et source).
- **Navigation Historique** : Possibilité de changer de chambre et de législature (remontant jusqu'à 2012 pour l'Assemblée).

## Installation

### Prérequis

- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- npm (installé avec Node.js)

### Étapes

1. Clonez le dépôt ou téléchargez les fichiers.
2. Ouvrez un terminal dans le dossier du projet.
3. Installez les dépendances :
   ```bash
   npm install
   ```
4. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```
5. Ouvrez votre navigateur à l'adresse indiquée (généralement `http://localhost:5173`).

## Sources des Données

Les données utilisées par cette application proviennent de sources officielles et journalistiques fiables :

### Listes des Élus (Open Data)
- **Assemblée Nationale** : Données issues de [data.assemblee-nationale.fr](https://data.assemblee-nationale.fr/).
- **Sénat** : Données issues de [data.senat.fr](https://data.senat.fr/).

### Recensement des Condamnations
Les condamnations affichées sont basées sur des faits publics rapportés par la presse nationale française, notamment :
- *Le Monde*
- *Libération*
- *Le Figaro*
- *Le Parisien*
- *Le Point*
- *Mediapart*

*Note : Cette application se concentre sur les condamnations définitives ou les affaires ayant fait l'objet d'une large couverture médiatique documentée.*

## Technologies Utilisées

- [Vite](https://vitejs.dev/) : Outil de build et serveur de développement.
- [D3.js](https://d3js.org/) : Bibliothèque de manipulation de documents basée sur les données pour le rendu de l'hémicycle.
- [Playwright](https://playwright.dev/) : Pour les tests de vérification automatisés.
