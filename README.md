# Magnésie

Carnet de calisthenics et de mobilité : séance du jour, gestes animés, minuteurs
(repos, tenues, routine de mobilité), progression automatique. Tout fonctionne
hors ligne et les données restent sur ton téléphone.

## Essayer tout de suite (sans rien installer)

Ouvre `www/index.html` dans un navigateur, ou héberge le dossier `www/` n'importe où.
Sur Android, avec Chrome : menu ⋮ puis « Ajouter à l'écran d'accueil » installe l'appli
comme une application (route PWA, la plus rapide).

## Obtenir l'APK : 3 routes

### Route A : GitHub (aucun logiciel à installer)
1. Crée un dépôt GitHub (privé ou public) et envoie-y tout le contenu de ce dossier.
2. Onglet **Actions** puis « Compiler l'APK Android » puis **Run workflow**
   (il se lance aussi à chaque envoi sur `main`).
3. Après 5 à 10 minutes, ouvre l'exécution terminée et télécharge l'artefact
   **magnesie-apk** (un zip qui contient `app-debug.apk`).
4. Passe l'APK sur le téléphone et ouvre-le. Android demandera d'autoriser
   « Installer des applis inconnues » pour le navigateur ou le gestionnaire de fichiers utilisé.

### Route B : Android Studio
1. Installe Node.js 20+ et Android Studio.
2. Dans ce dossier : `npm install` puis `npx cap sync android`.
3. `npx cap open android`, puis menu Build > Build Bundle(s) / APK(s) > Build APK(s).
   Ou en ligne de commande : `cd android && ./gradlew assembleDebug`
   (APK dans `android/app/build/outputs/apk/debug/app-debug.apk`).
   Il faut JDK 21.

### Route C : PWA
Voir « Essayer tout de suite ». Pas d'APK, mais une icône sur l'écran d'accueil et un
fonctionnement hors ligne. Il faut que les fichiers soient servis en HTTPS.

## Modifier l'appli
- Programme, exercices et mobilité : `www/app.js` (objets `EX`, `SESS`, `WEEK`, `MOB`).
- Animations des gestes : `www/anim.js` (une pose = quelques angles, interpolés).
- Après une modification : `npx cap sync android` puis recompiler.
- Icônes : `node make-icons.js` et `node make-android-icons.js`.

## À savoir
- Les données sont stockées dans l'appli (stockage local). Elles sont perdues si tu
  désinstalles l'appli : utilise **Corps > Copier ma sauvegarde** de temps en temps.
- Cette appli est séparée de la page web « Carnet Magnésie » : pas de synchronisation.
- L'APK produit est un APK de test (« debug »), suffisant pour un usage personnel.
  Pour le Play Store il faudrait signer une version release.
- Les animations sont des silhouettes schématiques en vue de côté ou de face : elles
  montrent la trajectoire et les positions, pas la technique fine.
