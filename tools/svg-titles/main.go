package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"

	"golang.org/x/sync/errgroup"
)

func uhoh(err error) {
	fmt.Fprintf(os.Stderr, "UH OH: %s\n", err)
	os.Exit(2)
}

func main() {
	args := os.Args[1:]

	if len(args) < 1 {
		fmt.Fprintln(os.Stderr, "NEEDS A DIRECTORY ARGUMENT")
		os.Exit(2)
	}

	var replacementsFile string
	flag.StringVar(&replacementsFile, "replacements", "filenames.json", "The JSON dict of filename to title replacements")
	flag.Parse()

	if replacementsFile == "" {
		fmt.Fprintln(os.Stderr, "NEEDS REPLACEMENTS!!!")
		os.Exit(2)
	}

	r, err := os.Open(replacementsFile)
	if err != nil {
		uhoh(err)
	}
	defer r.Close()

	var replacements map[string]string
	if err := json.NewDecoder(r).Decode(&replacements); err != nil {
		uhoh(err)
	}

	dir, err := filepath.Abs(args[0])
	if err != nil {
		uhoh(err)
	}

	fmt.Printf("Finding svg files in %s\n", dir)

	var files []string
	if err := filepath.Walk(dir, func(file string, f os.FileInfo, err error) error {
		if filepath.Ext(file) == ".svg" {
			files = append(files, file)
		}
		return nil
	}); err != nil {
		uhoh(err)
	}

	fmt.Printf("Found %d svg files\n", len(files))

	var g errgroup.Group
	for _, svg := range files {
		svg := svg
		g.Go(func() error {
			return replace(svg, replacements)
		})
	}

	if err := g.Wait(); err != nil {
		uhoh(err)
	}
}

func replace(filename string, replacements map[string]string) error {
	base := path.Base(filename)

	replacement := replacements[base]

	// early return if no filename replacement match
	if replacement == "" {
		return nil
	}

	b, err := ioutil.ReadFile(filename)
	if err != nil {
		return err
	}

	// early return if already has title
	if bytes.Contains(b, []byte("<title>")) {
		return nil
	}

	return ioutil.WriteFile(filename, bytes.Replace(b, []byte(`xmlns="http://www.w3.org/2000/svg">`), []byte(fmt.Sprintf(`xmlns="http://www.w3.org/2000/svg"><title>%s</title>`, replacement)), 1), 0644)
}
