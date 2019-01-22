{
  "targets": [
    {
      "target_name": "twainh",
      "sources": [ "src/twainh.cc" ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ]
    }
  ]
}