export default {
  'time.pageTitle':              'Temps',
  'time.pageSubtitle':           'Journal des heures passées sur vos projets',
  'time.new':                    'Saisir du temps',
  'time.empty':                  'Aucune entrée de temps',

  'time.noProjects':             'Aucun projet pour le moment — créez-en un pour saisir du temps',
  'time.createProject':          'Créer un projet',

  'time.allProjects':            'Tous les projets',
  'time.from':                   'Du',
  'time.to':                     'Au',
  'time.thisMonth':              'Ce mois',

  'time.projectLabel':           'Projet',
  'time.taskLabel':              'Tâche',
  'time.noTask':                 'Aucune tâche',
  'time.durationLabel':          'Durée',
  'time.durationRequired':       'Indiquez une durée supérieure à zéro',
  'time.dateLabel':              'Date',
  'time.billable':               'Facturable',
  'time.pomodoro':               'Pomodoro',
  'time.description':            'Description',
  'time.descriptionPlaceholder': 'Sur quoi avez-vous travaillé ?',

  'time.modal.createTitle':      'Saisir du temps',
  'time.modal.editTitle':        'Modifier l’entrée',

  'time.toast.created':          'Temps enregistré',
  'time.toast.saved':            'Entrée mise à jour',
  'time.toast.deleted':          'Entrée supprimée',

  'time.view.journal':           'Journal',
  'time.view.pomodoro':          'Pomodoro',

  'time.pomo.phase.ready':       'Prêt',
  'time.pomo.phase.work':        'Travail',
  'time.pomo.phase.shortBreak':  'Pause courte',
  'time.pomo.phase.longBreak':   'Longue pause',

  'time.pomo.start':             'Démarrer',
  'time.pomo.pause':             'Pause',
  'time.pomo.resume':            'Reprendre',
  'time.pomo.finish':            'Terminer',
  'time.pomo.reset':             'Réinitialiser',
  'time.pomo.chooseProject':     'Choisir un projet',
  'time.pomo.todayCount':        '{count} pomodoro(s) aujourd’hui',
  'time.pomo.untilLong':         '{current}/{total} avant longue pause',

  'time.pomo.settings.title':      'Réglages du Pomodoro',
  'time.pomo.settings.work':       'Travail (min)',
  'time.pomo.settings.shortBreak': 'Pause courte (min)',
  'time.pomo.settings.longBreak':  'Longue pause (min)',
  'time.pomo.settings.interval':   'Longue pause tous les',
  'time.pomo.settings.hint':       'Une longue pause survient après ce nombre de pomodoros.',

  'time.pomo.toast.shortBreak':    'Pomodoro terminé · {minutes} min enregistrées — pause de {break} min',
  'time.pomo.toast.longBreak':     'Pomodoro terminé · {minutes} min enregistrées — longue pause de {break} min',
  'time.pomo.toast.backToWork':    'Pause terminée — au travail ({minutes} min)',
  'time.pomo.toast.stopped':       'Pomodoro arrêté · {minutes} min enregistrées',
  'time.pomo.toast.settingsSaved': 'Réglages du Pomodoro enregistrés',
} satisfies Record<string, string>
