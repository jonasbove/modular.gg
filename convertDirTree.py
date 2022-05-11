import os

excluded_folders = ['node_modules', 'documentation', 'favicons']
excluded_files = ['.DS_Store', 'package.json', 'package-lock.json', 'modular.gg.code-workspace', 'README.md', 'site.webmanifest']
excluded_extensions = ['.', 'png', 'jpg', 'example', 'svg', 'py']

def isExcluded(file):
  if (file in excluded_folders):
    return True
  if (file in excluded_files):
    return True
  if (file[0] == '.'):
    return True
  
  extension = file.split('.')
  if (len(extension) >= 2):
    return extension[1] in excluded_extensions

def rec(path, i):
  for file in os.listdir(path):
    if (os.path.isdir(path + '/' + file)):
      if (not isExcluded(file)):
        print('.' + str(i) + ' ' + file + '.')
        rec(path + '/' + file, i + 1)
    elif (os.path.isfile(path + '/' + file)):
      if (not isExcluded(file)):
        print('.' + str(i) + ' ' + file + '.')

rec('.', 2)