# FJ Smart Lock Card 🔐

Carte Lovelace Home Assistant indépendante, en français québécois.

## Fonctionnalités
- État de serrure et durée depuis le dernier changement observé par Home Assistant
- Cadenas SVG animé (ouverture/fermeture)
- Boutons verrouiller et déverrouiller via les services natifs Home Assistant
- Confirmation avant déverrouillage
- Éditeur visuel pour choisir une entité `lock.*`
- Aucune dépendance au projet Alarm Keeper Card

## Installation
1. Télécharger `fj-smart-lock-card.js` depuis ce dépôt.
2. Copier dans `/config/www/fj-smart-lock-card.js`.
3. Ajouter une ressource Lovelace **Module JavaScript** : `/local/fj-smart-lock-card.js?v=1.0.1`.
4. Rafraîchir Home Assistant, puis ajouter la carte **FJ Smart Lock Card**.

## YAML
```yaml
type: custom:fj-smart-lock-card
entity: lock.porte_arriere
title: Porte arrière
confirm_unlock: true
```

Remplacer `lock.porte_arriere` par l'entité réelle.

## Notes
- Le compteur utilise `last_changed` de Home Assistant, et reflète le dernier changement d'état enregistré.
- Tester avec une serrure réelle; syntaxe JavaScript vérifiable séparément.
- Ne pas confondre l'état de la serrure avec un capteur de porte ouverte/fermée.

Licence MIT. Code original sans réutilisation du code d'Alarm Keeper Card.
