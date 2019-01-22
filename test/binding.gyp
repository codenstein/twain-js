{
  'targets': [
    {
      'target_name': 'twainh',
      'sources': [ 'twainh.cc' ],
      'include_dirs': [
        '<!(node -e "require(\'nan\')")'
      ],
    }
  ]
}